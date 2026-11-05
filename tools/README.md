Refresh `cams.json` (run from the repo root, needs Node 18+):

    node tools/cams-osm.mjs Illinois cams.json
    node tools/cams-chicago.mjs cams.json

The first pulls every OpenStreetMap speed / red-light camera in the state (Overpass, can take a minute or fail when busy; just retry).
The second adds the City of Chicago's official speed and red-light camera lists, with the directions each one watches.
