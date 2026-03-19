import './DesignSystemShowcase.css'

/**
 * DesignSystemShowcase
 * A comprehensive showcase of all design tokens from the Vault Design System
 * Based on Catppuccin Macchiato palette
 */

export function DesignSystemShowcase() {
  return (
    <div className="design-system-showcase">
      {/* Header */}
      <header className="showcase-section">
        <h1 className="showcase-title">Design System</h1>
        <p className="showcase-subtitle">Vault — Catppuccin Macchiato</p>
      </header>

      {/* Color Palette */}
      <section className="showcase-section">
        <h2 className="section-title">Colors</h2>

        <div className="color-group">
          <h3 className="group-title">Background Layers</h3>
          <div className="color-grid">
            <ColorSwatch
              name="--color-bg"
              value="#181926"
              usage="App background"
            />
            <ColorSwatch
              name="--color-surface"
              value="#1e2030"
              usage="Elevated surfaces"
            />
            <ColorSwatch
              name="--color-overlay"
              value="#24273a"
              usage="Drag overlay, modal"
            />
          </div>
        </div>

        <div className="color-group">
          <h3 className="group-title">Borders</h3>
          <div className="color-grid">
            <ColorSwatch
              name="--color-border"
              value="#363a4f"
              usage="Dividers, borders"
            />
            <ColorSwatch
              name="--color-border-subtle"
              value="#494d64"
              usage="De-emphasized"
            />
          </div>
        </div>

        <div className="color-group">
          <h3 className="group-title">Text</h3>
          <div className="color-grid">
            <ColorSwatch
              name="--color-text"
              value="#cad3f5"
              usage="Primary text"
            />
            <ColorSwatch
              name="--color-text-muted"
              value="#a5adcb"
              usage="Timestamps, labels"
            />
            <ColorSwatch
              name="--color-text-faint"
              value="#939ab7"
              usage="Placeholder text"
            />
          </div>
        </div>

        <div className="color-group">
          <h3 className="group-title">Semantic</h3>
          <div className="color-grid">
            <ColorSwatch name="--color-error" value="#ed8796" usage="Errors" />
            <ColorSwatch
              name="--color-success"
              value="#a6da95"
              usage="Success"
            />
            <ColorSwatch
              name="--color-warning"
              value="#eed49f"
              usage="Warnings"
            />
            <ColorSwatch
              name="--color-accent"
              value="#8bd5ca"
              usage="Interactive, focus"
            />
          </div>
        </div>

        <div className="color-group">
          <h3 className="group-title">Accent Options</h3>
          <div className="color-grid">
            <ColorSwatch name="Teal" value="#8bd5ca" usage="Default accent" />
            <ColorSwatch name="Lavender" value="#b7bdf8" usage="" />
            <ColorSwatch name="Sapphire" value="#7dc4e4" usage="" />
            <ColorSwatch name="Mauve" value="#c6a0f6" usage="" />
            <ColorSwatch name="Pink" value="#f5bde6" usage="" />
            <ColorSwatch name="Sky" value="#91d7e3" usage="" />
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="showcase-section">
        <h2 className="section-title">Typography</h2>

        <div className="typography-group">
          <h3 className="group-title">Font Families</h3>
          <div className="font-demo">
            <p className="font-sans-demo">Geist (Sans) — The quick brown fox</p>
            <p className="font-mono-demo">System Mono — The quick brown fox</p>
          </div>
        </div>

        <div className="typography-group">
          <h3 className="group-title">Type Scale</h3>
          <div className="type-scale">
            <TypeSample
              name="text-xs"
              size="11px"
              weight="400"
              lineHeight="1.4"
              sample="Fine print, file size"
            />
            <TypeSample
              name="text-sm"
              size="13px"
              weight="400"
              lineHeight="1.5"
              sample="Timestamps, labels, hostname"
            />
            <TypeSample
              name="text-base"
              size="15px"
              weight="400"
              lineHeight="1.6"
              sample="Block body text"
            />
            <TypeSample
              name="text-base-medium"
              size="15px"
              weight="500"
              lineHeight="1.6"
              sample="URL body, emphasis"
            />
            <TypeSample
              name="text-label"
              size="12px"
              weight="500"
              lineHeight="1.4"
              sample="Block type labels, icon labels"
            />
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section className="showcase-section">
        <h2 className="section-title">Spacing</h2>
        <p className="section-note">Base unit: 4px</p>
        <div className="spacing-samples">
          <SpacingSample name="space-1" value="4px" />
          <SpacingSample name="space-2" value="8px" />
          <SpacingSample name="space-3" value="12px" />
          <SpacingSample name="space-4" value="16px" />
          <SpacingSample name="space-5" value="20px" />
          <SpacingSample name="space-6" value="24px" />
          <SpacingSample name="space-8" value="32px" />
        </div>
      </section>

      {/* Interactive States */}
      <section className="showcase-section">
        <h2 className="section-title">Interactive States</h2>
        <div className="state-samples">
          <div className="state-item">
            <button className="btn-demo" type="button">
              Default Button
            </button>
            <span className="state-label">Default</span>
          </div>
          <div className="state-item">
            <button className="btn-demo focus" type="button">
              Focused Button
            </button>
            <span className="state-label">Focus (2px accent ring)</span>
          </div>
          <div className="state-item">
            <button className="btn-demo disabled" disabled type="button">
              Disabled Button
            </button>
            <span className="state-label">Disabled (--color-text-faint)</span>
          </div>
        </div>
      </section>

      {/* Feed Layout */}
      <section className="showcase-section">
        <h2 className="section-title">Feed Layout</h2>
        <div className="layout-demo">
          <div className="feed-mock">
            <div className="feed-block">
              <header className="block-header">
                <span className="block-type">Article</span>
                <span className="block-timestamp">2 min ago</span>
              </header>
              <p className="block-content">
                Block body text goes here with proper typography.
              </p>
            </div>
            <div className="feed-divider" />
            <div className="feed-block">
              <header className="block-header">
                <span className="block-type">Link</span>
                <span className="block-timestamp">5 min ago</span>
              </header>
              <p className="block-content">
                <a href="/" className="url-link">
                  https://example.com/article
                </a>
              </p>
            </div>
            <div className="feed-divider" />
            <div className="feed-block">
              <header className="block-header">
                <span className="block-type">File</span>
                <span className="block-timestamp">10 min ago</span>
              </header>
              <p className="block-content">
                document.pdf <span className="file-size">2.4 MB</span>
              </p>
            </div>
          </div>
          <div className="layout-specs">
            <p>Max-width: 720px</p>
            <p>Horizontal padding: 16px</p>
            <p>Block padding: 12px vertical, 16px horizontal</p>
            <p>Divider: 1px solid (--color-border)</p>
            <p>Border radius: 4px</p>
          </div>
        </div>
      </section>
    </div>
  )
}

// Helper components
function ColorSwatch({
  name,
  value,
  usage,
}: {
  name: string
  value: string
  usage: string
}) {
  return (
    <div className="color-swatch">
      <div className="swatch-preview" style={{ backgroundColor: value }} />
      <div className="swatch-info">
        <code className="swatch-name">{name}</code>
        <span className="swatch-value">{value}</span>
        {usage && <span className="swatch-usage">{usage}</span>}
      </div>
    </div>
  )
}

function TypeSample({
  name,
  size,
  weight,
  lineHeight,
  sample,
}: {
  name: string
  size: string
  weight: string
  lineHeight: string
  sample: string
}) {
  return (
    <div className="type-sample">
      <div className="type-info">
        <code className="type-name">{name}</code>
        <span className="type-specs">
          {size} / {weight} / {lineHeight}
        </span>
      </div>
      <p
        className="type-preview"
        style={{
          fontSize: size,
          fontWeight: weight,
          lineHeight,
        }}
      >
        {sample}
      </p>
    </div>
  )
}

function SpacingSample({ name, value }: { name: string; value: string }) {
  const pxValue = Number.parseInt(value)
  return (
    <div className="spacing-sample">
      <code className="spacing-name">{name}</code>
      <span className="spacing-value">{value}</span>
      <div
        className="spacing-visual"
        style={{
          width: `${pxValue * 4}px`,
          height: '24px',
        }}
      />
    </div>
  )
}
