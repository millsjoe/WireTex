import { LANDING_EXAMPLE } from "@/lib/site/landing-example";
import { parseWireTex } from "@/lib/wiretex/parse";
import { render } from "@/lib/wiretex/renderer";
import { defaultThemes, themeToStyle } from "@/lib/site/themes";

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
