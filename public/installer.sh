#!/bin/sh
#
# Installs dnocs, the dPanel command-line tool, on macOS or Linux:
#
#   curl --proto '=https' --tlsv1.2 -sSf https://dnocs.devetek.app/installer.sh | sh
#
# Optional settings:
#   DNOCS_VERSION      A release to install, such as v0.1.20. Default: the newest.
#   DNOCS_INSTALL_DIR  Where to put dnocs. Default: /usr/local/bin, or
#                      ~/.local/bin when that cannot be written.
#
# Everything runs from main, called on the last line, so a download cut off
# half way runs nothing.

set -eu

BASE_URL="https://raw.githubusercontent.com/dPanel-ID/artifacts/main/cli"
DEFAULT_INSTALL_DIR="/usr/local/bin"

say() {
	printf 'dnocs: %s\n' "$1"
}

fail() {
	printf 'dnocs: error: %s\n' "$1" >&2
	exit 1
}

need() {
	command -v "$1" >/dev/null 2>&1 || fail "this installer needs '$1', which was not found"
}

fetch() {
	curl --proto '=https' --proto-redir '=https' --tlsv1.2 -fsSL "$@"
}

detect_os() {
	case "$(uname -s)" in
	Linux) echo linux ;;
	Darwin) echo darwin ;;
	*) fail "$(uname -s) is not supported; dnocs runs on macOS and Linux" ;;
	esac
}

detect_arch() {
	case "$(uname -m)" in
	x86_64 | amd64) echo amd64 ;;
	aarch64 | arm64) echo arm64 ;;
	*) fail "$(uname -m) is not supported; dnocs runs on amd64 and arm64" ;;
	esac
}

resolve_version() {
	version="${DNOCS_VERSION:-}"
	if [ -z "$version" ]; then
		version="$(fetch "$BASE_URL/LATEST")" || fail "could not read the newest version"
		version="$(printf '%s' "$version" | tr -d '[:space:]')"
	fi
	case "$version" in
	v[0-9]*) ;;
	*) fail "'$version' is not a dnocs version; expected something like v0.1.20" ;;
	esac
	case "$version" in
	*[!a-zA-Z0-9.-]*) fail "'$version' is not a dnocs version; expected something like v0.1.20" ;;
	esac
	echo "$version"
}

sha256_of() {
	if command -v sha256sum >/dev/null 2>&1; then
		sha256sum "$1" | cut -d ' ' -f 1
	elif command -v shasum >/dev/null 2>&1; then
		shasum -a 256 "$1" | cut -d ' ' -f 1
	else
		fail "this installer needs 'sha256sum' or 'shasum' to check the download"
	fi
}

# verify_download FILE SUMS ASSET stops unless FILE matches the checksum the
# release publishes for ASSET.
verify_download() {
	expected="$(awk -v asset="$3" '$2 == asset { print $1 }' "$2")"
	[ -n "$expected" ] || fail "the release lists no checksum for $3"
	actual="$(sha256_of "$1")"
	[ "$actual" = "$expected" ] || fail "checksum mismatch for $3; nothing was installed"
}

install_with_sudo() {
	command -v sudo >/dev/null 2>&1 || return 1
	say "administrator access is needed to write to $2"
	sudo mkdir -p "$2" && sudo install -m 0755 "$1" "$2/dnocs"
}

# install_binary FILE puts dnocs in place and prints the directory it chose.
install_binary() {
	if [ -n "${DNOCS_INSTALL_DIR:-}" ]; then
		mkdir -p "$DNOCS_INSTALL_DIR" 2>/dev/null || true
		if [ -w "$DNOCS_INSTALL_DIR" ]; then
			install -m 0755 "$1" "$DNOCS_INSTALL_DIR/dnocs"
		else
			install_with_sudo "$1" "$DNOCS_INSTALL_DIR" >&2 || fail "could not write to $DNOCS_INSTALL_DIR"
		fi
		echo "$DNOCS_INSTALL_DIR"
		return
	fi

	if [ -d "$DEFAULT_INSTALL_DIR" ] && [ -w "$DEFAULT_INSTALL_DIR" ]; then
		install -m 0755 "$1" "$DEFAULT_INSTALL_DIR/dnocs"
		echo "$DEFAULT_INSTALL_DIR"
		return
	fi
	if install_with_sudo "$1" "$DEFAULT_INSTALL_DIR" >&2; then
		echo "$DEFAULT_INSTALL_DIR"
		return
	fi

	[ -n "${HOME:-}" ] || fail "could not write to $DEFAULT_INSTALL_DIR and HOME is not set"
	mkdir -p "$HOME/.local/bin"
	install -m 0755 "$1" "$HOME/.local/bin/dnocs"
	echo "$HOME/.local/bin"
}

main() {
	for tool in curl uname mktemp awk cut tr install; do
		need "$tool"
	done

	os="$(detect_os)"
	arch="$(detect_arch)"
	version="$(resolve_version)"
	asset="dpanelprod-cli-$os-$arch"

	work_dir="$(mktemp -d)"
	trap 'rm -rf "$work_dir"' EXIT INT TERM

	say "downloading $version for $os/$arch"
	fetch -o "$work_dir/dnocs" "$BASE_URL/$version/$asset" ||
		fail "could not download $version for $os/$arch; check that the version exists"
	fetch -o "$work_dir/SHA256SUMS" "$BASE_URL/$version/SHA256SUMS" ||
		fail "could not download the checksums for $version"
	verify_download "$work_dir/dnocs" "$work_dir/SHA256SUMS" "$asset"

	install_dir="$(install_binary "$work_dir/dnocs")"
	say "installed $version to $install_dir/dnocs"

	case ":${PATH:-}:" in
	*":$install_dir:"*) ;;
	*) say "add $install_dir to your PATH to run dnocs by name: export PATH=\"$install_dir:\$PATH\"" ;;
	esac
	say "next, sign in: dnocs auth login -u your-username"
}

main "$@"
