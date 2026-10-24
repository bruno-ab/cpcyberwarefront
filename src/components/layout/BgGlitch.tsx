/** Fixed ambient cyberpunk glitch layers behind all pages. */
export const BgGlitch = () => (
  <div className="cp-bg-glitch" aria-hidden>
    <div className="cp-bg-glitch__noise" />
    <div className="cp-bg-glitch__tear" />
    <div className="cp-bg-glitch__tear" />
    <div className="cp-bg-glitch__tear" />
    <div className="cp-bg-glitch__block" />
    <div className="cp-bg-glitch__block" />
    <div className="cp-bg-glitch__block" />
    <div className="cp-bg-glitch__vignette" />
  </div>
);

export default BgGlitch;
