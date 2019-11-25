#!/bin/bash
cd ../libraries/auth-tools
npm install
npm link
cd ../../auth
npm link auth-tools