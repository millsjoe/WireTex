import { LANDING_EXAMPLE } from "@/lib/landing-example";
import { parseWireTex } from "@/lib/parse";
import { render } from "@/lib/renderer";
import { defaultThemes, themeToStyle } from "@/lib/themes";

export function LandingExample() {
  const html = render(parseWireTex(LANDING_EXAMPLE));
  const theme = defaultThemes[0];

  return (
    <div className="landing-example-grid">
      <pre className="landing-code">{LANDING_EXAMPLE}</pre>
      <div
        className="landing-preview wiretex-content"
        style={themeToStyle(theme.vars)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
