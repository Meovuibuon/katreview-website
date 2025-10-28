#!/bin/bash

echo "Starting KatReview Website..."
echo

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing root dependencies"
    exit 1
fi

echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Error installing server dependencies"
    exit 1
fi

echo "Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error installing client dependencies"
    exit 1
fi

echo
echo "All dependencies installed successfully!"
echo
echo "Starting development servers..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo

cd ..
npm run dev
