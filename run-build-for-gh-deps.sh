#!/bin/bash

# TODO: This file is temporary and will be removed after testing

log() {
  echo "=============================== $1 ==============================="
}

run_command() {
  echo "\$ $1"
  eval $1
}

log "Starting deployment script"
run_command "pwd"

# frontend-component-header
log "Processing frontend-component-header"
run_command "cd node_modules/@edx/" || exit
log "Current directory: $(pwd)"
run_command "rm -rf frontend-component-header"
run_command "mkdir frontend-component-header" || exit
run_command "git clone -b Peter_Kulko/use-SPA-functionality --single-branch https://github.com/raccoongang/frontend-component-header.git frontend-component-header-temp"
run_command "cd frontend-component-header-temp" || exit
log "Current directory: $(pwd)"
run_command "npm ci" || exit
run_command "npm run build" || exit
run_command "cp -r dist ../frontend-component-header/" || exit
run_command "cp -r package.json ../frontend-component-header/" || exit
run_command "cd .."
run_command "rm -rf frontend-component-header-temp"
run_command "cd ../.." || exit
log "Current directory: $(pwd)"

# webpack
log "Running webpack"
run_command "fedx-scripts webpack"

log "Deployment script finished."