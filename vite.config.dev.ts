import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Development-optimized Vite configuration
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Enable development helpers
      devTarget: 'es2020',
    })
  ],
  
  // Development server configuration
  server: {
    host: "0.0.0.0", // Allow external connections (for mobile testing)
    port: 8081,
    strictPort: true, // Don't try other ports
    open: false, // Don't auto-open browser
    cors: true,
    
    // Hot Module Replacement settings
    hmr: {
      overlay: true, // Show errors in overlay
      clientPort: 8081,
    },
    
    // Watch options for better file watching
    watch: {
      usePolling: true, // Better for some file systems
      interval: 100, // Fast polling for quick updates
    },
  },
  
  // Build settings optimized for development
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    // Don't minify in development builds
    minify: false,
    // Keep original names for easier debugging
    rollupOptions: {
      output: {
        // Preserve module names
        preserveModules: false,
        // Better chunk names for debugging
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Target modern browsers for development
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  
  // Path resolution
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Development-specific optimizations
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      '@tanstack/react-query'
    ],
    // Force re-optimization on these changes
    force: false,
  },
  
  // Enable detailed logging
  logLevel: 'info',
  
  // Clear screen on rebuild
  clearScreen: false,
  
  // Define environment variables for development
  define: {
    __DEV__: true,
    __DEBUG__: true,
    'process.env.NODE_ENV': '"development"',
  },
  
  // CSS configuration for development
  css: {
    devSourcemap: true, // Enable CSS source maps
    preprocessorOptions: {
      // Add any CSS preprocessor options here
    }
  },
  
  // Enable experimental features for better DX
  experimental: {
    renderBuiltUrl: (filename) => {
      return `/${filename}`;
    }
  }
});