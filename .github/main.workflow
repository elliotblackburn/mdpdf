workflow "Release pipeline" {
  on = "push"
  resolves = ["Publish"]
}

action "Build" {
  uses = "actions/npm@e7aaefe"
  args = "install"
}

action "Filter for: Tag pushed" {
  needs = "Build"
  uses = "actions/bin/filter@b2bea07"
  args = "tag"
}

action "Filter for: Master branch" {
  needs = "Filter for: Tag pushed"
  uses = "actions/bin/filter@b2bea07"
  args = "branch master"
}

action "Publish" {
  needs = "Filter for: Master branch"
  uses = "actions/npm@e7aaefe"
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
