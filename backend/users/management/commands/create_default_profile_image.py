from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Creates the default profile image'

    def handle(self, *args, **options):
        # Create a 200x200 circular image with a dark background
        img = Image.new('RGBA', (200, 200), color=(0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw a circle with dark background
        draw.ellipse((0, 0, 200, 200), fill='#1E293B')
        
        # Draw the user silhouette
        draw.ellipse((75, 50, 125, 100), fill='#CBD5E1')  # Head
        draw.ellipse((50, 110, 150, 210), fill='#CBD5E1')  # Body
        
        # Ensure the directory exists
        media_dir = os.path.join(settings.MEDIA_ROOT, 'profile_images')
        os.makedirs(media_dir, exist_ok=True)
        
        # Save the image
        image_path = os.path.join(media_dir, 'default_profile.png')
        img.save(image_path)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created default profile image at {image_path}')) 