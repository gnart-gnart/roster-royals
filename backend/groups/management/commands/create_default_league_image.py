from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw, ImageFont
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Creates the default league image'

    def handle(self, *args, **options):
        # Create a 400x200 image with a dark background
        img = Image.new('RGB', (400, 200), color='#1E293B')
        draw = ImageDraw.Draw(img)
        
        # Add text
        text = "League Image"
        # Use default font since we can't guarantee system fonts
        draw.text((200, 100), text, fill='#CBD5E1', anchor="mm")
        
        # Ensure the directory exists
        media_dir = os.path.join(settings.MEDIA_ROOT, 'league_images')
        os.makedirs(media_dir, exist_ok=True)
        
        # Save the image
        image_path = os.path.join(media_dir, 'default_league.png')
        img.save(image_path)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created default league image at {image_path}')) 