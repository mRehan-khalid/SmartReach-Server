// routes/router.js
const fs = require('fs');
const path = require('path');
const express = require('express');

class Router {
    constructor() {
        this.startFolder = null;
    }
    load(app, folderName) {
        if (!this.startFolder) this.startFolder = path.basename(folderName);

        fs.readdirSync(folderName).forEach((file) => {
            const fullName = path.join(folderName, file);
            const stat = fs.lstatSync(fullName);

            if (stat.isDirectory()) {
                this.load(app, fullName);
            } else if (file.toLowerCase().endsWith('.js')) {
                let dirs = path.dirname(fullName).split(path.sep);

                if (dirs[0].toLowerCase() === this.startFolder.toLowerCase()) {
                    dirs.splice(0, 1);
                }

                const router = express.Router();

                const baseRoute = '/' + dirs.join('/');
                console.log(`Created route: ${baseRoute} for ${fullName}`);

                const ControllerClass = require('../' + fullName);
                new ControllerClass(router);

                app.use(baseRoute, router);
            }
        });
    }
}

module.exports = new Router();