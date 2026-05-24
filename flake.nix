{
  description = "Inbox - Python + Node.js development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        name = "inbox-dev";

        packages = with pkgs; [
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
        ];

        shellHook = ''
          # Ensure Podman policy.json is in place (copied from project on first entry)
          mkdir -p ~/.config/containers
          if [ ! -f ~/.config/containers/policy.json ]; then
              cp "$PWD/.config/containers/policy.json" ~/.config/containers/policy.json 2>/dev/null || true
          fi

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
