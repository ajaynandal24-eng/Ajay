"""
A Python script that draws a stylised picture of Narendra Modi
standing on the summit of Mount Everest using matplotlib.

Run:
    python modi_on_everest.py

The image is saved as  modi_on_everest.png  in the current directory
and also displayed interactively (if a display is available).
"""

import math
import matplotlib
matplotlib.use("Agg")           # use non-interactive backend so the script
                                # works even without a display
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Arc, FancyArrowPatch
import numpy as np


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def draw_mountain(ax):
    """Draw a snowy Mount-Everest silhouette."""
    # Sky gradient (blue → light blue)
    sky = np.linspace(0, 1, 256).reshape(1, -1)
    ax.imshow(
        sky,
        aspect="auto",
        extent=[0, 10, 0, 10],
        cmap="Blues",
        alpha=0.6,
        zorder=0,
    )

    # Main mountain body (dark grey)
    mountain_x = [0, 2, 4.5, 5.0, 5.5, 8, 10, 10, 0]
    mountain_y = [0, 3, 7.5, 8.6, 7.5, 3.5, 1,  0,  0]
    ax.fill(mountain_x, mountain_y, color="#4a4a4a", zorder=1)

    # Snow cap
    snow_x = [4.2, 4.5, 5.0, 5.5, 5.8, 5.0]
    snow_y = [7.0, 7.5, 8.6, 7.5, 7.0, 7.2]
    ax.fill(snow_x, snow_y, color="white", zorder=2)

    # Secondary peak (left)
    peak2_x = [1.5, 2.5, 3.5, 2.5]
    peak2_y = [3.0, 5.5, 3.5, 3.0]
    ax.fill(peak2_x, peak2_y, color="#5a5a5a", zorder=1)
    ax.fill([2.2, 2.5, 2.8, 2.5], [5.0, 5.5, 5.1, 5.0], color="white", zorder=2)

    # Secondary peak (right)
    peak3_x = [6.5, 7.5, 8.5, 7.5]
    peak3_y = [3.0, 5.0, 3.5, 3.0]
    ax.fill(peak3_x, peak3_y, color="#5a5a5a", zorder=1)
    ax.fill([7.1, 7.5, 7.9, 7.5], [4.5, 5.0, 4.6, 4.5], color="white", zorder=2)

    # Ground / base
    ax.fill([0, 10, 10, 0], [0, 0, 0.5, 0.5], color="#3b2a1a", zorder=1)


def draw_sun(ax):
    """Draw a bright sun in the upper-left corner."""
    sun = plt.Circle((1.2, 9.0), 0.55, color="#FFD700", zorder=4)
    ax.add_patch(sun)
    # Rays
    for angle in range(0, 360, 40):
        rad = math.radians(angle)
        x0 = 1.2 + 0.65 * math.cos(rad)
        y0 = 9.0 + 0.65 * math.sin(rad)
        x1 = 1.2 + 0.95 * math.cos(rad)
        y1 = 9.0 + 0.95 * math.sin(rad)
        ax.plot([x0, x1], [y0, y1], color="#FFD700", lw=2, zorder=4)


def draw_clouds(ax):
    """Draw a couple of fluffy clouds."""
    for cx, cy, scale in [(7.5, 8.8, 1.0), (3.2, 9.2, 0.7)]:
        for dx, dy, r in [(0, 0, 0.35), (0.3, 0.1, 0.28), (-0.28, 0.05, 0.25)]:
            c = plt.Circle((cx + dx * scale, cy + dy * scale),
                            r * scale, color="white", zorder=3, alpha=0.9)
            ax.add_patch(c)


def draw_flag(ax, pole_x, pole_y):
    """Draw a small Indian tricolour flag on a pole."""
    pole_height = 0.9
    ax.plot([pole_x, pole_x], [pole_y, pole_y + pole_height],
            color="#8B4513", lw=2, zorder=6)

    flag_w, flag_h = 0.55, 0.35
    # Saffron stripe (top)
    ax.add_patch(mpatches.FancyBboxPatch(
        (pole_x, pole_y + pole_height - flag_h / 3),
        flag_w, flag_h / 3,
        boxstyle="square,pad=0", color="#FF9933", zorder=6))
    # White stripe (middle)
    ax.add_patch(mpatches.FancyBboxPatch(
        (pole_x, pole_y + pole_height - 2 * flag_h / 3),
        flag_w, flag_h / 3,
        boxstyle="square,pad=0", color="white", zorder=6))
    # Green stripe (bottom)
    ax.add_patch(mpatches.FancyBboxPatch(
        (pole_x, pole_y + pole_height - flag_h),
        flag_w, flag_h / 3,
        boxstyle="square,pad=0", color="#138808", zorder=6))
    # Ashoka Chakra (blue circle on white band)
    chakra_cx = pole_x + flag_w / 2
    chakra_cy = pole_y + pole_height - flag_h / 2
    chakra = plt.Circle((chakra_cx, chakra_cy), 0.045,
                         fill=False, edgecolor="#000080", lw=1.2, zorder=7)
    ax.add_patch(chakra)
    # Spokes
    for angle in range(0, 360, 30):
        rad = math.radians(angle)
        ax.plot([chakra_cx, chakra_cx + 0.042 * math.cos(rad)],
                [chakra_cy, chakra_cy + 0.042 * math.sin(rad)],
                color="#000080", lw=0.6, zorder=7)


def draw_person(ax, x, y):
    """
    Draw a simple stylised figure representing Narendra Modi on the summit:
    - kurta / jacket (saffron/orange tones)
    - characteristic white hair / beard
    - raised arm with flag pole
    """
    scale = 1.0   # overall person scale

    def s(v):
        return v * scale

    # --- Legs ---
    # Left leg
    ax.plot([x - s(0.06), x - s(0.10)], [y, y - s(0.35)],
            color="#1a237e", lw=s(6), solid_capstyle="round", zorder=5)
    # Right leg
    ax.plot([x + s(0.06), x + s(0.10)], [y, y - s(0.35)],
            color="#1a237e", lw=s(6), solid_capstyle="round", zorder=5)

    # --- Feet ---
    ax.plot([x - s(0.10), x - s(0.17)], [y - s(0.35), y - s(0.36)],
            color="#3e2723", lw=s(5), solid_capstyle="round", zorder=5)
    ax.plot([x + s(0.10), x + s(0.17)], [y - s(0.35), y - s(0.36)],
            color="#3e2723", lw=s(5), solid_capstyle="round", zorder=5)

    # --- Body (kurta – saffron) ---
    body = mpatches.FancyBboxPatch(
        (x - s(0.13), y),
        s(0.26), s(0.40),
        boxstyle="round,pad=0.02",
        color="#FF6F00", zorder=5,
    )
    ax.add_patch(body)

    # Kurta centre line
    ax.plot([x, x], [y + s(0.40), y + s(0.05)],
            color="#E65100", lw=s(1.5), zorder=6)

    # --- Left arm (relaxed at side) ---
    ax.plot([x - s(0.13), x - s(0.20)], [y + s(0.35), y + s(0.05)],
            color="#FF6F00", lw=s(7), solid_capstyle="round", zorder=5)
    # Left hand
    ax.add_patch(plt.Circle((x - s(0.21), y + s(0.03)),
                             s(0.045), color="#FFCCBC", zorder=5))

    # --- Right arm (raised, holding flag) ---
    ax.plot([x + s(0.13), x + s(0.26)], [y + s(0.35), y + s(0.65)],
            color="#FF6F00", lw=s(7), solid_capstyle="round", zorder=5)
    # Right hand
    ax.add_patch(plt.Circle((x + s(0.27), y + s(0.67)),
                             s(0.045), color="#FFCCBC", zorder=5))

    # --- Neck ---
    ax.plot([x, x], [y + s(0.40), y + s(0.50)],
            color="#FFCCBC", lw=s(8), solid_capstyle="round", zorder=5)

    # --- Head ---
    head = plt.Circle((x, y + s(0.60)), s(0.13), color="#FFCCBC", zorder=5)
    ax.add_patch(head)

    # --- White hair (top of head) ---
    hair = plt.Circle((x, y + s(0.63)), s(0.11), color="white", zorder=6)
    ax.add_patch(hair)
    # Hair parting / texture
    ax.add_patch(plt.Circle((x, y + s(0.63)), s(0.065),
                             color="#FFCCBC", zorder=7))

    # --- Glasses ---
    for gx in [x - s(0.055), x + s(0.055)]:
        ax.add_patch(plt.Circle((gx, y + s(0.595)), s(0.030),
                                 fill=False, edgecolor="#212121",
                                 lw=s(1.2), zorder=8))
    ax.plot([x - s(0.025), x + s(0.025)], [y + s(0.595), y + s(0.595)],
            color="#212121", lw=s(1.0), zorder=8)

    # --- White beard ---
    beard = mpatches.FancyBboxPatch(
        (x - s(0.09), y + s(0.50)),
        s(0.18), s(0.08),
        boxstyle="round,pad=0.015",
        color="white", zorder=7,
    )
    ax.add_patch(beard)

    # --- Eyes ---
    for ex in [x - s(0.055), x + s(0.055)]:
        ax.add_patch(plt.Circle((ex, y + s(0.605)), s(0.012),
                                 color="#212121", zorder=9))

    # Flag pole in raised hand
    draw_flag(ax, x + s(0.27), y + s(0.67))

    # Jacket / waistcoat (sleeveless – Modi signature) – darker saffron layer
    vest = mpatches.FancyBboxPatch(
        (x - s(0.10), y + s(0.05)),
        s(0.20), s(0.35),
        boxstyle="round,pad=0.01",
        color="#E65100", zorder=4,
    )
    ax.add_patch(vest)


def draw_label(ax):
    """Add text labels."""
    ax.text(
        5.0, 0.25,
        "Narendra Modi on Mount Everest",
        ha="center", va="center",
        fontsize=14, fontweight="bold",
        color="white",
        bbox=dict(boxstyle="round,pad=0.3", fc="#1a237e", ec="white", lw=1.5),
        zorder=10,
    )
    ax.text(
        5.0, 9.75,
        "Summit – 8,848.86 m",
        ha="center", va="center",
        fontsize=9, style="italic",
        color="white", zorder=10,
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.patch.set_facecolor("#87CEEB")   # sky blue background

    draw_mountain(ax)
    draw_sun(ax)
    draw_clouds(ax)

    # Summit position (top of the mountain peak)
    person_x = 5.0
    person_y = 8.62

    draw_person(ax, person_x, person_y)
    draw_label(ax)

    plt.tight_layout(pad=0)
    output_file = "modi_on_everest.png"
    plt.savefig(output_file, dpi=150, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    print(f"Image saved as  {output_file}")
    plt.show()


if __name__ == "__main__":
    main()
