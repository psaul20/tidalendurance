---
description: "Performs visual validation of frontend changes across desktop and mobile viewports"
---

# validate-frontend

Performs visual validation of frontend changes across desktop and mobile viewports.

## Instructions

You are being asked to validate frontend changes visually. Follow these steps:

1. **Determine the page to validate:**
   - Ask the user which HTML file or page to validate (default: index.html)
   - Construct the file path or localhost URL

2. **Desktop View Validation (1920x1080):**
   - Navigate to the page using `mcp__playwright__browser_navigate`
   - Resize to desktop viewport using `mcp__playwright__browser_resize` with width: 1920, height: 1080
   - Take a screenshot using `mcp__playwright__browser_take_screenshot` and save as `desktop-{timestamp}.png`
   - Analyze the screenshot for:
     - Layout and spacing correctness
     - Content alignment
     - Visual consistency

3. **Mobile View Validation (375x812):**
   - Resize to mobile viewport using `mcp__playwright__browser_resize` with width: 375, height: 812
   - Take a screenshot using `mcp__playwright__browser_take_screenshot` and save as `mobile-{timestamp}.png`
   - Analyze the screenshot for:
     - Responsive behavior
     - Touch target sizes (minimum 44x44px recommended)
     - Content reflow and readability

4. **Cross-Viewport Comparison:**
   - Compare both screenshots
   - Check for:
     - Layout inconsistencies between viewports
     - Content cutoff or overlapping
     - Missing or broken responsive behavior
     - Proper scaling of images and typography

5. **Report Findings:**
   - Summarize any issues found
   - Provide specific recommendations for fixes
   - If everything looks good, confirm validation passed

**Note:** This is a static site, so use `file://` URL with absolute path to the HTML file, or start a local server if needed.

Delete any screenshots once completed.
