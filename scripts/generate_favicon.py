import os
from PIL import Image, ImageDraw

def generate_favicon():
    # Create a 512x512 transparent canvas
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Circular background (Slate color: #1E293B)
    draw.ellipse([0, 0, size, size], fill="#1E293B")
    
    # 2. Outer temperature ring (blue left, red-orange right)
    # Pillow draw.arc coordinates: bounds, start_angle, end_angle, fill, width
    # 0 is east (right), angles go clockwise.
    # Left arc: 90 (bottom) to 270 (top)
    draw.arc([40, 40, 472, 472], start=90, end=270, fill="#3B82F6", width=16)
    # Right arc: 270 (top) to 90 (bottom)
    draw.arc([40, 40, 472, 472], start=270, end=90, fill="#EF4444", width=16)
    
    # 3. White house outline
    house_points = [(130, 230), (256, 120), (382, 230), (382, 390), (130, 390), (130, 230)]
    for i in range(len(house_points) - 1):
        draw.line([house_points[i], house_points[i+1]], fill="#FFFFFF", width=20, joint="round")
        
    # 4. Snowflake (Blue #3B82F6) - Centered at X=195, Y=280
    sf_x, sf_y = 195, 280
    draw.line([(sf_x, sf_y - 40), (sf_x, sf_y + 40)], fill="#3B82F6", width=12)
    draw.line([(sf_x - 40, sf_y), (sf_x + 40, sf_y)], fill="#3B82F6", width=12)
    draw.line([(sf_x - 28, sf_y - 28), (sf_x + 28, sf_y + 28)], fill="#3B82F6", width=12)
    draw.line([(sf_x - 28, sf_y + 28), (sf_x + 28, sf_y - 28)], fill="#3B82F6", width=12)
    
    # 5. Flame (Red-Orange #EF4444 and Yellow #F59E0B) - Centered at X=310, Y=325
    # Outer red-orange flame
    draw.ellipse([280, 295, 340, 355], fill="#EF4444")
    draw.polygon([(280, 325), (310, 265), (340, 325)], fill="#EF4444")
    
    # Inner yellow flame
    draw.ellipse([293, 315, 327, 349], fill="#F59E0B")
    draw.polygon([(293, 332), (310, 298), (327, 332)], fill="#F59E0B")
    
    # Output path
    public_dir = "/Users/wade/Sites/pac-isere.fr/public"
    
    # Save as ICO with multiple sizes for compatibility
    ico_path = os.path.join(public_dir, "favicon.ico")
    img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"Favicon successfully saved to: {ico_path}")

if __name__ == "__main__":
    generate_favicon()
