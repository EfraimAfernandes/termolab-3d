"""Gera o ícone do aplicativo Termodinâmica 3D (512x512 PNG).

Estilo: fundo escuro arredondado com gradiente ciano/azul,
um termômetro estilizado com escala e bolha de mercúrio brilhante.
"""
from PIL import Image, ImageDraw, ImageFilter

SIZE = 512
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# --- Fundo arredondado com gradiente vertical ciano escuro ---
radius = 96
mask = Image.new("L", (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([0, 0, SIZE, SIZE], radius=radius, fill=255)

bg = Image.new("RGBA", (SIZE, SIZE))
bg_draw = ImageDraw.Draw(bg)
top = (8, 14, 26)
bottom = (10, 24, 46)
for y in range(SIZE):
    t = y / (SIZE - 1)
    c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    bg_draw.line([(0, y), (SIZE, y)], fill=c + (255,))

img.paste(bg, (0, 0), mask)
draw = ImageDraw.Draw(img)

# --- Glow interno sutil (canto superior) ---
glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse([120, -40, 420, 260], fill=(0, 229, 255, 46))
glow = glow.filter(ImageFilter.GaussianBlur(60))
img = Image.alpha_composite(img, glow)
draw = ImageDraw.Draw(img)

# --- Termômetro (bulbo + tubo) ---
# Tubo
tube_x0, tube_x1 = 238, 274
tube_top, tube_bottom = 96, 372
draw.rounded_rectangle([tube_x0, tube_top, tube_x1, tube_bottom],
                       radius=18, fill=(18, 24, 40, 255),
                       outline=(0, 229, 255, 200), width=5)

# Escala (marcas)
for i, frac in enumerate([0.25, 0.45, 0.65, 0.85]):
    y = tube_top + (tube_bottom - tube_top) * frac
    x0 = tube_x0 + 10 if i % 2 else tube_x0 + 4
    draw.line([(x0, y), (tube_x1 - 6, y)], fill=(120, 140, 170, 255), width=4)

# Coluna de mercúrio
col_bottom = tube_bottom - 26
col_top = 210
draw.rounded_rectangle([tube_x0 + 12, col_top, tube_x1 - 12, col_bottom],
                       radius=8, fill=(0, 229, 255, 255))

# Bulbo
bulb_cx, bulb_cy, bulb_r = 256, 396, 46
draw.ellipse([bulb_cx - bulb_r, bulb_cy - bulb_r, bulb_cx + bulb_r, bulb_cy + bulb_r],
             fill=(0, 229, 255, 255))
# Brilho no bulbo
draw.ellipse([bulb_cx - 20, bulb_cy - 22, bulb_cx - 2, bulb_cy - 4],
             fill=(210, 250, 255, 230))

# --- Anel decorativo inferior ---
draw.arc([76, 380, 436, 470], start=20, end=160, fill=(0, 229, 255, 120), width=6)

img.save("build/icon.png")
print("build/icon.png gerado (512x512)")
