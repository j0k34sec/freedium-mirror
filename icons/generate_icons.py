#!/usr/bin/env python3
"""
Generate icons for Medium to Freedium Chrome Extension
Requires: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is required. Install it with: pip install Pillow")
    exit(1)

def create_icon(size):
    """Create an icon with the specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate corner radius (15% of size)
    radius = int(size * 0.15)
    
    # Draw rounded rectangle with gradient effect
    # Using green color (#00c853 to #00e676 gradient approximated)
    fill_color = (0, 200, 83, 255)  # #00c853
    border_color = (0, 168, 68, 255)  # #00a844
    
    # Draw rounded rectangle
    draw.rounded_rectangle(
        [(0, 0), (size-1, size-1)],
        radius=radius,
        fill=fill_color,
        outline=border_color,
        width=max(1, size // 16)
    )
    
    # Draw "M" letter for Medium
    try:
        # Try to use a system font
        font_size = int(size * 0.6)
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("Arial.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
    
    # Calculate text position (centered)
    text = "M"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2 - bbox[1])
    
    # Draw white "M"
    draw.text(position, text, fill=(255, 255, 255, 255), font=font)
    
    return img

def main():
    sizes = [16, 48, 128]
    
    print("Generating icons for Medium to Freedium extension...")
    
    for size in sizes:
        icon = create_icon(size)
        filename = f"icon{size}.png"
        icon.save(filename, "PNG")
        print(f"Created {filename} ({size}x{size})")
    
    print("\nAll icons generated successfully!")
    print("Icons are saved in the icons/ directory.")

if __name__ == "__main__":
    main()

