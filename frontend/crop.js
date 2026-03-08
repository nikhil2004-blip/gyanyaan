const { Jimp } = require('jimp');

async function processFavicon() {
    try {
        const image = await Jimp.read('./public/favicon.png');
        // The user wants to remove the white border and fit it to the screen.
        image.autocrop({
            tolerance: 0.1, // percentage of the color difference
            cropOnlyFrames: false,
            leaveBorder: 0,
        });

        // Resize back to a square if needed or just scale
        image.contain({ w: 512, h: 512 });

        await image.write('./public/favicon.png');
        console.log('Favicon cropped and saved.');
    } catch (error) {
        console.error('Error processing favicon:', error);
    }
}

processFavicon();
