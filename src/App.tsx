import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Drawer, 
  TextField, 
  Typography, 
  IconButton, 
  Grid, 
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

// Define theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

interface AppProps {
  editorManager: any;
}

export default function App({ editorManager }: AppProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [code, setCode] = useState('');
  const [config, setConfig] = useState({
    width: 720,
    height: 720,
    fontSize: 14,
    lineHeight: 18,
    fps: 30,
    duration: 10,
    language: 'rust'
  });
  const [isPlaying, setIsPlaying] = useState(false);

  // Initial load
  useEffect(() => {
    const loadInitialData = () => {
      const animations = (window as any).animationFunctions?.getAnimations();
      if (animations && animations.length > 0) {
        const codescroll = animations[0];
        if (typeof codescroll.getCode === 'function') {
          setCode(codescroll.getCode());
        }
        if (typeof codescroll.getConfig === 'function') {
          const animConfig = codescroll.getConfig();
          setConfig(prev => ({
            ...prev,
            fontSize: animConfig.fontSize || prev.fontSize,
            lineHeight: animConfig.lineHeight || prev.lineHeight,
            height: animConfig.canvasHeight || prev.height,
            language: animConfig.language || prev.language
          }));
        }
      }
      
      // Get global config
      const fps = editorManager.getFPS();
      const frameCount = editorManager.getFrameCount();
      setConfig(prev => ({
        ...prev,
        fps: fps,
        duration: parseFloat((frameCount / fps).toFixed(1))
      }));

      // Get canvas size
      const canvas = document.querySelector('canvas');
      if (canvas) {
        setConfig(prev => ({
          ...prev,
          width: canvas.width,
          height: canvas.height
        }));
      }
    };

    // Wait a bit for p5 to initialize
    setTimeout(loadInitialData, 1000);
    
    // Subscribe to playback changes
    editorManager.setEvents({
      onPlaybackChange: (playing: boolean) => setIsPlaying(playing)
    });
  }, [editorManager]);

  const handleApply = () => {
    // Update Canvas Size
    if ((window as any).animationFunctions?.resizeCanvas) {
      (window as any).animationFunctions.resizeCanvas(config.width, config.height);
    }

    // Update FPS and Frame Count
    editorManager.setFPS(config.fps);
    editorManager.setFrameCount(Math.floor(config.fps * config.duration));

    // Update Animation Config
    const animations = (window as any).animationFunctions?.getAnimations();
    if (animations && animations.length > 0) {
      const codescroll = animations[0];
      if (typeof codescroll.updateCode === 'function') {
        codescroll.updateCode(code);
      }
      if (typeof codescroll.updateConfig === 'function') {
        codescroll.updateConfig({
          fontSize: config.fontSize,
          lineHeight: config.lineHeight,
          canvasHeight: config.height,
          language: config.language
        });
      }
    }

    // Reset animation
    editorManager.setCurrentFrame(0);
  };

  const handleExportZip = () => {
    if (editorManager.isEncodingActive()) return;
    editorManager.setCurrentFrame(0);
    editorManager.stopPlayback();
    editorManager.startEncoding();
  };

  const togglePlayback = () => {
    editorManager.togglePlayback();
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* Canvas Container is managed by p5, we just provide the div in index.html or here if we moved it */}
      {/* Since p5 attaches to #canvas-container, we can leave it outside or wrap it. 
          For now, the p5 logic expects #canvas-container in the DOM. 
          We will render the UI overlay on top. */}

      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          onClick={togglePlayback}
          color="secondary"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => setIsDrawerOpen(true)}
        >
          Edit Code
        </Button>
      </Box>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { width: 400, p: 3, backgroundColor: 'rgba(30, 30, 30, 0.95)' }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Configuration</Typography>
          <IconButton onClick={() => setIsDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Language</InputLabel>
              <Select
                value={config.language}
                label="Language"
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
              >
                <MenuItem value="rust">Rust</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="go">Go</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Width"
              type="number"
              fullWidth
              size="small"
              value={config.width}
              onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Height"
              type="number"
              fullWidth
              size="small"
              value={config.height}
              onChange={(e) => setConfig({ ...config, height: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Font Size"
              type="number"
              fullWidth
              size="small"
              value={config.fontSize}
              onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Line Height"
              type="number"
              fullWidth
              size="small"
              value={config.lineHeight}
              onChange={(e) => setConfig({ ...config, lineHeight: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="FPS"
              type="number"
              fullWidth
              size="small"
              value={config.fps}
              onChange={(e) => setConfig({ ...config, fps: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Duration (s)"
              type="number"
              fullWidth
              size="small"
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) })}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mb: 1 }}>Code</Typography>
        <TextField
          multiline
          rows={15}
          fullWidth
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ 
            mb: 3,
            '& .MuiInputBase-input': {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '12px',
            }
          }}
          spellCheck={false}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleApply}
            size="large"
          >
            Apply Changes
          </Button>
          
          <Button 
            variant="contained" 
            color="error" 
            fullWidth 
            startIcon={<DownloadIcon />}
            onClick={handleExportZip}
            size="large"
          >
            Export PNG Sequence (ZIP)
          </Button>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}
