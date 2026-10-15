export default function BrowserExtensionGuide() {
  return (
    <section className="vd-panel vd-stack">
      <h1>Study video in your browser</h1>
      <p>
        The optional Chrome/Edge extension adds a small study panel to an
        accessible HTML5 video or audio player. Bring your own target and
        English subtitles, replay and loop lines, read pattern notes, and export
        useful phrases back into this app.
      </p>
      <a
        className="vd-button vd-primary"
        href="/extensions/vocab-drawer-browser.zip"
        download
      >
        Download the browser extension
      </a>
      <ol style={{ listStyle: "decimal", paddingLeft: 24 }}>
        <li>Unzip the package and open your browser’s extension manager.</li>
        <li>
          Enable Developer mode and choose Load unpacked for the extracted
          folder.
        </li>
        <li>
          Open the video page, click the extension, choose your subtitle tracks,
          and open the study panel.
        </li>
        <li>
          Export saved phrases before closing the panel, then merge the file in
          Backups & device transfer.
        </li>
      </ol>
      <p>
        Access is granted for the tab you choose. The extension makes no network
        requests. Some protected or iframe players do not expose a usable player
        or captions; imported tracks work where the media element is accessible.
      </p>
    </section>
  );
}
