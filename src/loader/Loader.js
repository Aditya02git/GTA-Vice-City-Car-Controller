export default class Loader {
    constructor(totalItems = 1, title = 'Loading...') {
        this.totalItems = totalItems;
        this.loadedItems = 0;
        this.title = title;
        this.isVisible = false;
        this.onComplete = null;
        
        this.createLoader();
    }

    createLoader() {
        // Create loader overlay
        this.loaderOverlay = document.createElement('div');
        this.loaderOverlay.id = 'model-loader';
        this.loaderOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
            color: white;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Create loading spinner
        this.loadingSpinner = document.createElement('div');
        this.loadingSpinner.style.cssText = `
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #00ff88;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        `;

        // Add CSS animation 
        if (!document.getElementById('loader-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                
                .loader-pulse {
                    animation: pulse 1.5s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }

        // Create loading text
        this.loadingText = document.createElement('div');
        this.loadingText.style.cssText = `
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 500;
        `;
        this.loadingText.textContent = this.title;

        // Create progress bar container
        this.progressContainer = document.createElement('div');
        this.progressContainer.style.cssText = `
            width: 300px;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 10px;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
        `;

        // Create progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00ff88, #00cc66);
            border-radius: 3px;
            transition: width 0.4s ease;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        `;

        // Create progress percentage
        this.progressText = document.createElement('div');
        this.progressText.style.cssText = `
            font-size: 14px;
            opacity: 0.8;
            font-weight: 300;
        `;
        this.progressText.textContent = '0%';

        // Create details text (optional)
        this.detailsText = document.createElement('div');
        this.detailsText.style.cssText = `
            font-size: 12px;
            opacity: 0.6;
            margin-top: 10px;
            text-align: center;
        `;
        this.detailsText.textContent = `Loading ${this.totalItems} items...`;

        // Assemble loader
        this.progressContainer.appendChild(this.progressBar);
        this.loaderOverlay.appendChild(this.loadingSpinner);
        this.loaderOverlay.appendChild(this.loadingText);
        this.loaderOverlay.appendChild(this.progressContainer);
        this.loaderOverlay.appendChild(this.progressText);
        this.loaderOverlay.appendChild(this.detailsText);
    }

    show() {
        if (!this.isVisible) {
            document.body.appendChild(this.loaderOverlay);
            this.isVisible = true;
            // Trigger fade in
            setTimeout(() => {
                this.loaderOverlay.style.opacity = '1';
            }, 10);
        }
    }

    hide() {
        if (this.isVisible) {
            this.loaderOverlay.style.opacity = '0';
            
            setTimeout(() => {
                if (this.loaderOverlay && this.loaderOverlay.parentNode) {
                    this.loaderOverlay.parentNode.removeChild(this.loaderOverlay);
                    this.isVisible = false;
                }
            }, 300);
        }
    }

    updateProgress(increment = 1, itemName = '') {
        this.loadedItems += increment;
        const progress = Math.min((this.loadedItems / this.totalItems) * 100, 100);
        
        // Update progress bar
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${Math.round(progress)}%`;
        
        // Update details if item name provided
        if (itemName) {
            this.detailsText.textContent = `Loaded: ${itemName}`;
        } else {
            this.detailsText.textContent = `${this.loadedItems}/${this.totalItems} items loaded`;
        }
        
        // Check if complete
        if (this.loadedItems >= this.totalItems) {
            this.complete();
        }
    }

    complete() {
        this.loadingText.textContent = 'Complete!';
        this.detailsText.textContent = 'All models loaded successfully';
        this.loadingSpinner.style.display = 'none';
        
        // Call completion callback if provided
        if (this.onComplete && typeof this.onComplete === 'function') {
            this.onComplete();
        }
        
        // Auto-hide after short delay
        setTimeout(() => {
            this.hide();
        }, 800);
    }

    setTitle(title) {
        this.title = title;
        if (this.loadingText) {
            this.loadingText.textContent = title;
        }
    }

    setDetails(details) {
        if (this.detailsText) {
            this.detailsText.textContent = details;
        }
    }

    setProgress(percentage) {
        const clampedProgress = Math.max(0, Math.min(100, percentage));
        this.progressBar.style.width = `${clampedProgress}%`;
        this.progressText.textContent = `${Math.round(clampedProgress)}%`;
    }

    setOnComplete(callback) {
        this.onComplete = callback;
    }

    isComplete() {
        return this.loadedItems >= this.totalItems;
    }

    reset() {
        this.loadedItems = 0;
        this.progressBar.style.width = '0%';
        this.progressText.textContent = '0%';
        this.loadingText.textContent = this.title;
        this.detailsText.textContent = `Loading ${this.totalItems} items...`;
        this.loadingSpinner.style.display = 'block';
    }

    destroy() {
        this.hide();
        // Remove styles if no other loaders exist
        const existingLoaders = document.querySelectorAll('[id^="model-loader"]');
        if (existingLoaders.length <= 1) {
            const styles = document.getElementById('loader-styles');
            if (styles) {
                styles.remove();
            }
        }
    }
}
