"""Inbox CLI — terminal interface to the API server."""

import sys
from pathlib import Path
from typing import Optional

import httpx
import typer
from rich.console import Console
from rich.table import Table

app = typer.Typer(help="Chaotic Inbox — capture anything, find it later")
console = Console()

# Config file path
CONFIG_PATH = Path.home() / ".config" / "inbox" / "config.toml"
DEFAULT_API_URL = "http://localhost:8080"


def _client() -> httpx.Client:
    """Create an HTTP client pointing at the configured API."""
    # TODO: load config from file
    return httpx.Client(base_url=DEFAULT_API_URL, timeout=30.0)


@app.command()
def add(
    content: Optional[str] = typer.Argument(default=None, help="Text or URL to capture"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="File to upload"),
    stdin: bool = typer.Option(False, "--stdin", help="Read from stdin"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON"),
) -> None:
    """Capture text, a URL, or a file into the inbox."""
    client = _client()

    if stdin:
        content = sys.stdin.read().strip()
    elif file:
        if not file.exists():
            console.print(f"[red]File not found:[/red] {file}")
            raise typer.Exit(code=1)
        # TODO: multipart upload
        console.print(f"[yellow]File upload not yet implemented[/yellow]")
        raise typer.Exit(code=1)

    if not content:
        console.print("[red]Nothing to capture.[/red]")
        raise typer.Exit(code=1)

    # Simple type detection
    item_type = "url" if content.startswith(("http://", "https://")) else "text"

    resp = client.post("/v1/items", json={"raw_text": content, "type": item_type})
    resp.raise_for_status()
    data = resp.json()

    short_id = str(data["id"]).split("-")[0]
    if json_output:
        console.print_json(data=data)
    else:
        console.print(f"Captured [green]✓[/green] [{short_id}]")


@app.command()
def list(
    limit: int = typer.Option(20, "--limit", "-n", min=1, max=100),
    item_type: Optional[str] = typer.Option(None, "--type", "-t"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON"),
) -> None:
    """Browse the chronological feed."""
    client = _client()
    params: dict = {"limit": limit}
    if item_type:
        params["type"] = item_type

    resp = client.get("/v1/items", params=params)
    resp.raise_for_status()
    data = resp.json()

    if json_output:
        console.print_json(data=data)
        return

    table = Table(show_header=True, header_style="bold")
    table.add_column("Type", width=6)
    table.add_column("Content", min_width=40)
    table.add_column("Captured", width=20)

    for item in data:
        raw = item.get("raw_text") or item.get("blob_path") or "..."
        table.add_row(
            item["type"],
            raw[:80] + "..." if len(raw) > 80 else raw,
            item["captured_at"],
        )
    console.print(table)


@app.command()
def info(
    item_id: str = typer.Argument(..., help="Item ID (full or short)"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON"),
) -> None:
    """Show full details of an item."""
    client = _client()
    resp = client.get(f"/v1/items/{item_id}")
    resp.raise_for_status()
    data = resp.json()

    if json_output:
        console.print_json(data=data)
    else:
        console.print(f"[bold]ID:[/bold]        {data['id']}")
        console.print(f"[bold]Type:[/bold]      {data['type']}")
        console.print(f"[bold]Captured:[/bold]  {data['captured_at']}")
        console.print(f"[bold]Raw:[/bold]       {data.get('raw_text', '...')}")


@app.command()
def delete(
    item_id: str = typer.Argument(..., help="Item ID to delete"),
    force: bool = typer.Option(False, "--force", "-f", help="Skip confirmation"),
) -> None:
    """Delete an item."""
    if not force:
        confirm = typer.confirm(f"Delete item {item_id}?", default=False)
        if not confirm:
            console.print("Cancelled.")
            raise typer.Exit()

    client = _client()
    resp = client.delete(f"/v1/items/{item_id}")
    if resp.status_code == 404:
        console.print("[red]Item not found[/red]")
        raise typer.Exit(code=3)
    resp.raise_for_status()
    console.print(f"Deleted [green]✓[/green]")


def main() -> None:
    app()
