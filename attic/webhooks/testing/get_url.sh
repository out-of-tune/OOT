#!/bin/bash
curl -w "%{url_effective}\n" -I -L -s -S https://smee.io/new -o /dev/null