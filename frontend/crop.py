from PIL import Image, ImageChops

def crop_favicon(input_path, output_path):
    try:
        im = Image.open(input_path).convert("RGBA")
        
        # we want to crop out anything that is white or transparent
        # Find white background
        bg = Image.new("RGBA", im.size, (255, 255, 255, 0))
        diff = ImageChops.difference(im, bg)
        # Also remove exact white (255, 255, 255, 255)
        bg2 = Image.new("RGBA", im.size, (255, 255, 255, 255))
        diff2 = ImageChops.difference(im, bg2)
        
        bbox = diff.getbbox()
        bbox2 = diff2.getbbox()
        
        if bbox:
            # combine bboxes or just use basic getbbox if it's mostly transparent
            bbox = im.getbbox()
            if bbox:
                im = im.crop(bbox)
                
            # If the image itself has a solid white border, let's just do a basic bounds 
            # based on non-white pixels
            target_bbox = None
            width, height = im.size
            pixels = im.load()
            
            min_x = width
            min_y = height
            max_x = 0
            max_y = 0
            
            for y in range(height):
                for x in range(width):
                    r, g, b, a = pixels[x, y]
                    if a > 10 and not (r > 240 and g > 240 and b > 240):
                        if x < min_x: min_x = x
                        if y < min_y: min_y = y
                        if x > max_x: max_x = x
                        if y > max_y: max_y = y
                        
            if min_x < max_x and min_y < max_y:
                # pad a little bit
                pad = 10
                min_x = max(0, min_x - pad)
                min_y = max(0, min_y - pad)
                max_x = min(width - 1, max_x + pad)
                max_y = min(height - 1, max_y + pad)
                im = im.crop((min_x, min_y, max_x + 1, max_y + 1))
            
            # Make it square
            w, h = im.size
            size = max(w, h)
            new_im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            new_im.paste(im, ((size - w) // 2, (size - h) // 2))
            
            new_im.thumbnail((512, 512), Image.Resampling.LANCZOS)
            new_im.save(output_path)
            print("Successfully cropped!")
    except Exception as e:
        print(f"Failed: {e}")

crop_favicon('./public/favicon.png', './public/favicon.png')
