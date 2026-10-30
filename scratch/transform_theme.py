from PIL import Image
import numpy as np

def rgb_to_hsv_np(rgb):
    r, g, b = rgb[:,:,0], rgb[:,:,1], rgb[:,:,2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    v = maxc
    deltac = maxc - minc
    s = np.zeros_like(v)
    non_zero = maxc != 0
    s[non_zero] = deltac[non_zero] / maxc[non_zero]
    
    h = np.zeros_like(v)
    rc = np.zeros_like(v)
    gc = np.zeros_like(v)
    bc = np.zeros_like(v)
    
    mask_d = deltac != 0
    rc[mask_d] = (maxc[mask_d] - r[mask_d]) / deltac[mask_d]
    gc[mask_d] = (maxc[mask_d] - g[mask_d]) / deltac[mask_d]
    bc[mask_d] = (maxc[mask_d] - b[mask_d]) / deltac[mask_d]
    
    mask_r = (r == maxc) & mask_d
    mask_g = (g == maxc) & mask_d
    mask_b = (b == maxc) & mask_d
    
    h[mask_r] = bc[mask_r] - gc[mask_r]
    h[mask_g] = 2.0 + rc[mask_g] - bc[mask_g]
    h[mask_b] = 4.0 + gc[mask_b] - rc[mask_b]
    h = (h / 6.0) % 1.0
    
    return np.stack([h, s, v], axis=-1)

def hsv_to_rgb_np(hsv):
    h, s, v = hsv[:,:,0], hsv[:,:,1], hsv[:,:,2]
    i = np.floor(h * 6.0).astype(int)
    f = (h * 6.0) - i
    p = v * (1.0 - s)
    q = v * (1.0 - s * f)
    t = v * (1.0 - s * (1.0 - f))
    i = i % 6
    
    rgb = np.zeros_like(hsv)
    m0 = (i == 0)
    m1 = (i == 1)
    m2 = (i == 2)
    m3 = (i == 3)
    m4 = (i == 4)
    m5 = (i == 5)
    
    rgb[m0] = np.stack([v[m0], t[m0], p[m0]], axis=-1)
    rgb[m1] = np.stack([q[m1], v[m1], p[m1]], axis=-1)
    rgb[m2] = np.stack([p[m2], v[m2], t[m2]], axis=-1)
    rgb[m3] = np.stack([p[m3], q[m3], v[m3]], axis=-1)
    rgb[m4] = np.stack([t[m4], p[m4], v[m4]], axis=-1)
    rgb[m5] = np.stack([v[m5], p[m5], q[m5]], axis=-1)
    
    return rgb

def transform_admin(img_path, out_path):
    img = Image.open(img_path).convert('RGB')
    arr = np.array(img, dtype=np.float32) / 255.0
    hsv = rgb_to_hsv_np(arr)
    
    # Target DigiTechzo green: #57B71B -> (87, 183, 27)
    dg_h = 0.269
    
    h = hsv[:,:,0]
    s = hsv[:,:,1]
    v = hsv[:,:,2]
    
    # Purple active indicator in sidebar, + New POS button, purple badges
    purple_mask = (h >= 0.65) & (h <= 0.82) & (s > 0.12)
    h[purple_mask] = dg_h
    s[purple_mask] = np.clip(s[purple_mask] * 1.15, 0.45, 0.95)
    v[purple_mask] = np.clip(v[purple_mask] * 1.1, 0.45, 0.90)
    
    res_hsv = np.stack([h, s, v], axis=-1)
    res_rgb = hsv_to_rgb_np(res_hsv)
    res_img = Image.fromarray((np.clip(res_rgb, 0, 1) * 255.0).astype(np.uint8))
    res_img.save(out_path, quality=95)
    print("Admin transformed:", out_path)

def transform_storefront(img_path, out_path):
    img = Image.open(img_path).convert('RGB')
    arr = np.array(img, dtype=np.float32) / 255.0
    hsv = rgb_to_hsv_np(arr)
    
    dg_h = 0.269
    h = hsv[:,:,0]
    s = hsv[:,:,1]
    v = hsv[:,:,2]
    
    # Bottle green banner & card backgrounds: Hue ~ 0.35 to 0.52
    green_mask = (h >= 0.35) & (h <= 0.52) & (s > 0.18)
    h[green_mask] = dg_h
    v[green_mask] = np.clip(v[green_mask] * 1.5, 0.1, 0.85)
    s[green_mask] = np.clip(s[green_mask] * 1.1, 0.4, 0.95)
    
    # Gold accents & badges: Hue ~ 0.08 to 0.16
    gold_mask = (h >= 0.08) & (h <= 0.16) & (s > 0.35) & (v > 0.4)
    h[gold_mask] = dg_h
    
    res_hsv = np.stack([h, s, v], axis=-1)
    res_rgb = hsv_to_rgb_np(res_hsv)
    res_img = Image.fromarray((np.clip(res_rgb, 0, 1) * 255.0).astype(np.uint8))
    res_img.save(out_path, quality=95)
    print("Storefront transformed:", out_path)

if __name__ == '__main__':
    admin_in = 'C:/Users/user/.gemini/antigravity/brain/909cd128-67e8-43dd-8782-6673d6a9b638/.user_uploaded/media_1793358662141_03492650.png'
    store_in = 'C:/Users/user/.gemini/antigravity/brain/909cd128-67e8-43dd-8782-6673d6a9b638/.user_uploaded/media_1793358635452_a771312c.png'
    
    admin_out = 'C:/Users/user/.gemini/antigravity/brain/909cd128-67e8-43dd-8782-6673d6a9b638/exact_admin_digitechzo.png'
    store_out = 'C:/Users/user/.gemini/antigravity/brain/909cd128-67e8-43dd-8782-6673d6a9b638/exact_storefront_digitechzo.png'
    
    transform_admin(admin_in, admin_out)
    transform_storefront(store_in, store_out)
