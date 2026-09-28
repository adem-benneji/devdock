import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Semantic version",
  "note": "Requires a strict major.minor.patch version, optionally with prerelease/build metadata. Comparison ignores build metadata. Range matching follows npm semver rules and excludes prereleases unless the range explicitly includes them.",
  "modes": [
    {
      "value": "inspect",
      "label": "Inspect version"
    },
    {
      "value": "major",
      "label": "Increment major"
    },
    {
      "value": "minor",
      "label": "Increment minor"
    },
    {
      "value": "patch",
      "label": "Increment patch"
    },
    {
      "value": "range",
      "label": "Match range"
    },
    {
      "value": "compare",
      "label": "Compare versions"
    }
  ],
  "fields": [
    {
      "key": "reference",
      "label": "Version or range (compare/range mode)",
      "initial": "^1.0.0",
      "multiline": false,
      "maxLength": 1000,
      "secret": false
    }
  ]
};
