#!/usr/bin/env zsh

echo "Compiling..."
npm run compile

if [[ $? -ne 0 ]]; then
    echo "Compilation failed!"
    exit 1
fi

echo "Deploying..."
npm run deploy

if [[ $? -ne 0 ]]; then
    echo "Deployment failed!"
    exit 1
fi

echo "Deployment successful!"
