import React, { useState } from 'react';
import { ReactCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    aspect: 16 / 9
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

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

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
        });
        onCropComplete(croppedFile);
      }
    }, 'image/jpeg');
  };

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>Crop Image</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={16 / 9}
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

export default ImageCropper; 