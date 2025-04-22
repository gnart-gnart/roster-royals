import React, { useState } from 'react';
import { ReactCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function CircularImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
    aspect: 1 // 1:1 aspect ratio for circular crop
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    
    // Set canvas size to the crop dimensions
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(
      completedCrop.width / 2,
      completedCrop.height / 2,
      completedCrop.width / 2,
      0,
      2 * Math.PI
    );
    ctx.clip();
    
    // Draw the image with the crop coordinates
    ctx.drawImage(
      imgRef,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert the canvas to a blob
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'cropped-profile-image.png', {
          type: 'image/png',
        });
        onCropComplete(croppedFile);
      }
    }, 'image/png');
  };

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>Crop Profile Image</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1} // 1:1 aspect ratio for circular crop
            circularCrop={true} // Enable circular cropping UI
          >
            <img
              ref={(ref) => setImgRef(ref)}
              src={URL.createObjectURL(image)}
              style={{ maxWidth: '100%' }}
              alt="Crop preview"
            />
          </ReactCrop>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={getCroppedImg} color="primary" variant="contained">
          Apply Crop
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CircularImageCropper; 