{
  description = "Inbox - Python + Node.js development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    git-hooks,
    ...
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    checks.${system}.pre-commit-check = git-hooks.lib.${system}.run {
      src = ./.;
      excludes = [".direnv/"];
      hooks = {
        alejandra.enable = true;
        deadnix = {
          enable = true;
          excludes = ["hardware-configuration"];
        };
        flake-checker.enable = true;
        end-of-file-fixer.enable = true;
        trim-trailing-whitespace.enable = true;
        check-merge-conflicts.enable = true;
      };
    };

    formatter.${system} = let
      config = self.checks.${system}.pre-commit-check.config;
      inherit (config) package configFile;
    in
      pkgs.writeShellScriptBin "pre-commit-run" ''
        ${pkgs.lib.getExe package} run --all-files --config ${configFile}
      '';

    devShells.${system}.default = let
      inherit (self.checks.${system}.pre-commit-check) shellHook enabledPackages;
    in
      pkgs.mkShell {
        name = "inbox-dev";

        packages = with pkgs;
          [
            # Python toolchain
            uv
            python3
            ruff

            # Node.js toolchain
            nodejs
            pnpm

            # PostgreSQL client tools
            postgresql

            # Playwright (for future e2e testing)
            playwright-driver
            playwright.browsers

            # Container tools (rootless, no daemon needed)
            podman
            podman-compose

            # Useful extras
            git
            gnumake
          ]
          ++ enabledPackages;

        shellHook = ''
          # Ensure Podman policy.json is in place (copied from project on first entry)
          mkdir -p ~/.config/containers
          if [ ! -f ~/.config/containers/policy.json ]; then
              cp "$PWD/.config/containers/policy.json" ~/.config/containers/policy.json 2>/dev/null || true
          fi

          # Guard against global core.hooksPath which breaks pre-commit hook installation.
          _global_hooksPath="$(${pkgs.git}/bin/git config --global core.hooksPath 2>/dev/null || true)"
          if [ -n "$_global_hooksPath" ]; then
            echo ""
            echo "WARNING: core.hooksPath is set globally ('$_global_hooksPath')."
            echo "This prevents pre-commit hooks from being installed by the Nix devShell."
            echo "Remove it with: git config --global --unset-all core.hooksPath"
            echo ""
          fi
          unset _global_hooksPath

          ${shellHook}

          echo "========================================"
          echo "  Inbox Development Shell"
          echo "========================================"
          echo ""
          echo "  Python:     $(python3 --version)"
          echo "  uv:         $(uv --version)"
          echo "  Node.js:    $(node --version)"
          echo "  pnpm:       $(pnpm --version)"
          echo "  Postgres:   $(psql --version)"
          echo "  Podman:     $(podman --version)"
          echo ""
          echo "  Quick start:"
          echo "    make dev    # Start everything"
          echo "    make test   # Run all tests"
          echo ""
          echo "========================================"
        '';

        # Ensure compiled Python wheels (e.g. numpy) can find libstdc++.so.6
        LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";

        # Playwright environment variables
        PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright.browsers}";
        PLAYWRIGHT_DRIVER_PATH = "${pkgs.playwright-driver}";
      };
  };
}
