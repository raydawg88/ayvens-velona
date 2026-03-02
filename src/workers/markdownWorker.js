// Web Worker for heavy markdown processing
import { marked } from 'marked'

// Configure marked options for consistency
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  sanitize: false // We trust our own content
})

// Handle messages from the main thread
self.onmessage = function(e) {
  const { id, content, options } = e.data

  try {
    // Perform the heavy markdown parsing in the worker thread
    const result = marked.parse(content, options || {})

    // Send the result back to the main thread
    self.postMessage({
      id,
      success: true,
      result
    })
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id,
      success: false,
      error: error.message,
      fallback: content // Send original content as fallback
    })
  }
}