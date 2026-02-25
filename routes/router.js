// routes/router.js
const fs = require('fs');
const path = require('path');
const express = require('express');

class Router {
    constructor() {
        this.startFolder = null;
    }

    // Called once during server startup
    load(app, folderName) {
        // Set initial startFolder if not set
        if (!this.startFolder) this.startFolder = path.basename(folderName);

        // Read all files/folders in the current folder
        fs.readdirSync(folderName).forEach((file) => {
            const fullName = path.join(folderName, file);
            const stat = fs.lstatSync(fullName);

            if (stat.isDirectory()) {
                // Recursively process subfolders
                this.load(app, fullName);
            } else if (file.toLowerCase().endsWith('.js')) {
                // Get folder path for route
                let dirs = path.dirname(fullName).split(path.sep);

                // Remove the root folder from route
                if (dirs[0].toLowerCase() === this.startFolder.toLowerCase()) {
                    dirs.splice(0, 1);
                }

                // Create Express router
                const router = express.Router();

                // Generate base route from folder structure
                const baseRoute = '/' + dirs.join('/');
                console.log(`Created route: ${baseRoute} for ${fullName}`);

                // Load controller class and pass the router
                const ControllerClass = require('../' + fullName);
                new ControllerClass(router);

                // Register the router with Express app
                app.use(baseRoute, router);
            }
        });
    }
}

module.exports = new Router();