#!/bin/bash

# =============================================================
#  01Blog - Dev Environment Setup (Ubuntu, no sudo/root)
#  Installs: Java 21, Maven, Node.js, Angular CLI, PostgreSQL
#            VS Code + all required extensions
# =============================================================

set -e  # exit on any error

# ── colors ────────────────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()     { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── dirs ──────────────────────────────────────────────────────
INSTALL_DIR="$HOME/.local/01blog-env"
mkdir -p "$INSTALL_DIR"

# ── helpers ───────────────────────────────────────────────────
add_to_profile() {
  local line="$1"
  local profile="$HOME/.bashrc"
  grep -qxF "$line" "$profile" || echo "$line" >> "$profile"
}

# =============================================================
#  1. JAVA 21 (via SDKMAN — no sudo needed)
# =============================================================
log "Installing SDKMAN and Java 21..."

if [ ! -d "$HOME/.sdkman" ]; then
  curl -s "https://get.sdkman.io" | bash
  ok "SDKMAN installed"
else
  warn "SDKMAN already installed, skipping"
fi

# source sdkman
export SDKMAN_DIR="$HOME/.sdkman"
source "$HOME/.sdkman/bin/sdkman-init.sh"

sdk install java 21.0.3-tem 2>/dev/null || warn "Java 21 already installed"
sdk default java 21.0.3-tem

add_to_profile 'export SDKMAN_DIR="$HOME/.sdkman"'
add_to_profile '[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"'

ok "Java 21 ready → $(java -version 2>&1 | head -1)"

# =============================================================
#  2. MAVEN (via SDKMAN)
# =============================================================
log "Installing Maven..."
sdk install maven 2>/dev/null || warn "Maven already installed"
ok "Maven ready → $(mvn -version 2>&1 | head -1)"

# =============================================================
#  3. NODE.JS (via NVM — no sudo needed)
# =============================================================
log "Installing NVM and Node.js LTS..."

if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  ok "NVM installed"
else
  warn "NVM already installed, skipping"
fi

# source nvm
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh" 2>/dev/null

nvm install --lts
nvm use --lts

add_to_profile 'export NVM_DIR="$HOME/.nvm"'
add_to_profile '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"'

ok "Node.js ready → $(node -v) | npm → $(npm -v)"

# =============================================================
#  4. ANGULAR CLI
# =============================================================
log "Installing Angular CLI..."
npm install -g @angular/cli
ok "Angular CLI ready → $(ng version 2>/dev/null | grep 'Angular CLI' | head -1)"

# =============================================================
#  5. POSTGRESQL (user-space via conda/portable install)
# =============================================================
# log "Setting up PostgreSQL (user-space)..."

# PG_VERSION="16.3"
# PG_SRC_DIR="$INSTALL_DIR/postgresql-$PG_VERSION"
# PG_DATA="$INSTALL_DIR/pgdata"

# if [ ! -d "$PG_SRC_DIR" ]; then
#   log "Downloading PostgreSQL $PG_VERSION source..."

#   curl -L -o /tmp/postgresql.tar.gz \
#     "https://ftp.postgresql.org/pub/source/v$PG_VERSION/postgresql-$PG_VERSION.tar.gz"

#   tar -xzf /tmp/postgresql.tar.gz -C "$INSTALL_DIR"
#   rm /tmp/postgresql.tar.gz

#   # build & install
#   cd "$PG_SRC_DIR" || exit 1
#   ./configure --prefix="$INSTALL_DIR/pgsql"
#   make -j$(nproc)
#   make install

#   # init DB
#   "$INSTALL_DIR/pgsql/bin/initdb" -D "$PG_DATA" --encoding=UTF8 --locale=C

#   ok "PostgreSQL $PG_VERSION built and installed"
# else
#   warn "PostgreSQL already installed, skipping"
# fi

# # add pg binaries to PATH
# add_to_profile "export PATH=\"$PG_DIR/bin:\$PATH\""
# export PATH="$PG_DIR/bin:$PATH"

# # start postgres (user-space, port 5432)
# log "Starting PostgreSQL..."
# PG_LOG="$INSTALL_DIR/pg.log"
# pg_ctl -D "$INSTALL_DIR/pgdata" -l "$PG_LOG" start 2>/dev/null || warn "PostgreSQL may already be running"

# sleep 2

# # create 01blog database
# createdb 01blog 2>/dev/null || warn "Database '01blog' already exists"
# ok "PostgreSQL ready → database '01blog' created"

# =============================================================
#  6. VS CODE (user-space .deb install)
# =============================================================
log "Installing VS Code..."

if ! command -v code &>/dev/null; then
  VS_URL="https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64"
  curl -L "$VS_URL" -o "/tmp/vscode.deb"

  # extract without dpkg (no sudo)
  mkdir -p "$INSTALL_DIR/vscode-deb"
  cd "$INSTALL_DIR/vscode-deb"
  ar x /tmp/vscode.deb
  tar -xf data.tar.gz -C "$HOME" 2>/dev/null || tar -xf data.tar.xz -C "$HOME" 2>/dev/null
  rm /tmp/vscode.deb
  cd -

  add_to_profile "export PATH=\"\$HOME/usr/share/code:\$PATH\""
  export PATH="$HOME/usr/share/code:$PATH"
  ok "VS Code installed"
else
  warn "VS Code already installed, skipping"
fi

# =============================================================
#  7. VS CODE EXTENSIONS
# =============================================================
log "Installing VS Code extensions..."

EXTENSIONS=(
  # Java & Spring Boot
  "vscjava.vscode-java-pack"
  "vmware.vscode-boot-dev-pack"
  "gabrielbb.vscode-lombok"
  # Angular
  "angular.ng-template"
  # Linting & quality
  "dbaeumer.vscode-eslint"
  # API testing
  "humao.rest-client"
  # Git
  "eamodio.gitlens"
  # Database
  "cweijan.vscode-database-client2"
)

for ext in "${EXTENSIONS[@]}"; do
  code --install-extension "$ext" --force 2>/dev/null && ok "Installed: $ext" || warn "Could not install: $ext"
done

# =============================================================
#  8. GIT CONFIG REMINDER
# =============================================================
log "Checking Git..."
if ! git config --global user.name &>/dev/null; then
  warn "Git user not configured. Run:"
  echo '  git config --global user.name "Your Name"'
  echo '  git config --global user.email "you@example.com"'
else
  ok "Git already configured as: $(git config --global user.name)"
fi

# =============================================================
#  DONE
# =============================================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  01Blog dev environment setup complete!   ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  ${BLUE}Java 21${NC}      → $(java -version 2>&1 | awk -F '"' '/version/ {print $2}')"
echo -e "  ${BLUE}Maven${NC}        → $(mvn -version 2>&1 | awk '{print $3}' | head -1)"
echo -e "  ${BLUE}Node.js${NC}      → $(node -v)"
echo -e "  ${BLUE}Angular CLI${NC}  → $(ng version 2>/dev/null | grep 'Angular CLI' | awk '{print $3}')"
echo -e "  ${BLUE}PostgreSQL${NC}   → $(pg_ctl --version | awk '{print $3}')"
echo -e "  ${BLUE}VS Code${NC}      → $(code --version 2>/dev/null | head -1)"
echo ""
echo -e "${YELLOW}⚡ Run this to apply PATH changes in your current shell:${NC}"
echo -e "   source ~/.bashrc"
echo ""
echo -e "${YELLOW}🐘 To start PostgreSQL next time:${NC}"
echo -e "   pg_ctl -D $INSTALL_DIR/pgdata -l $INSTALL_DIR/pg.log start"
echo ""





# Ila bghitiii t runi hadchiiiiiiii :
# 1. make it executable
# chmod +x setup.sh

# 2. run it
# ./setup.sh

# 3. apply PATH changes
# source ~/.bashrc

#./mvnw spring-boot:run