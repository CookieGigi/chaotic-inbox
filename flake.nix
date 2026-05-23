{
  description = "Development environment with Node.js, Python, and Playwright MCP";

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
        name = "playwright-mcp-dev";

        packages = with pkgs; [
          # Node.js toolchain
          nodejs_22
          pnpm

          # Python toolchain
          python313
          uv

          # Playwright (core + browsers)
          playwright-driver
          playwright.browsers

          # Useful extras
          git
        ];

        shellHook = ''
          echo "========================================"
          echo "  Playwright MCP Development Shell"
          echo "========================================"
          echo ""
          echo "  Node.js:    $(node --version)"
          echo "  pnpm:       $(pnpm --version)"
          echo "  Python:     $(python3 --version)"
          echo "  uv:         $(uv --version)"
          echo ""
          echo "  Playwright browsers are managed by Nix."
          echo ""
          echo "  Quick start:"
          echo "    pnpm init                    # Initialize Node.js project"
          echo "    uv init                      # Initialize Python project"
          echo "    npx @playwright/mcp@latest  # Run Playwright MCP server"
          echo ""
          echo "========================================"
        '';

        # Tell Playwright where to find the Nix-managed browser binaries.
        # This avoids downloading browsers into ~/.cache/ms-playwright.
        PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright.browsers}";

        # Also set the driver path so Playwright can find its core tools.
        PLAYWRIGHT_DRIVER_PATH = "${pkgs.playwright-driver}";
      };
    };
}
