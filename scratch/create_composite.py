from PIL import Image, ImageDraw, ImageFont

im_store = Image.open('C:/Users/user/.gemini/antigravity/brain/909cd128-67e8-43dd-8782-6673d6a9b638/exact_storefront_digitechzo.png')
im_admin = Image.open('C:/Users/user/.gemini/antigravity/brain/909cd128-67e8-43dd-8782-6673d6a9b638/exact_admin_digitechzo.png')

# Create a presentation canvas with padding
h = max(im_store.height, im_admin.height)
pad = 30
header_h = 60
w = im_store.width + im_admin.width + pad * 3

canvas = Image.new('RGB', (w, h + header_h + pad * 2), (245, 247, 250))
draw = ImageDraw.Draw(canvas)

# Title & subtitle bar
# DigiTechzo green header accent
draw.rectangle([(0, 0), (w, 6)], fill=(87, 183, 27))

# Paste storefront and admin with subtle drop shadow border
# Storefront at (pad, header_h + pad)
canvas.paste(im_store, (pad, header_h + pad))
# Admin at (pad * 2 + im_store.width, header_h + pad)
canvas.paste(im_admin, (pad * 2 + im_store.width, header_h + pad))

# Border around both
draw.rectangle([(pad - 1, header_h + pad - 1), (pad + im_store.width, header_h + pad + im_store.height)], outline=(226, 232, 240), width=2)
draw.rectangle([(pad * 2 + im_store.width - 1, header_h + pad - 1), (pad * 2 + im_store.width + im_admin.width, header_h + pad + im_admin.height)], outline=(226, 232, 240), width=2)

out_comp = 'C:/Users/user/.gemini/antigravity/brain/909cd128-67e8-43dd-8782-6673d6a9b638/digitechzo_exact_page_preview.png'
canvas.save(out_comp, quality=95)
print("Composite saved to", out_comp)
