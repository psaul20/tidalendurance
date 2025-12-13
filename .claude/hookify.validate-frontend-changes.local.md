---
name: validate-frontend-changes
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(html|css|scss|sass)$
---

## Visual Validation Required

You just modified a frontend file. **Use Playwright to validate the changes visually.**

### Required Checks:

1. **Desktop View (1920x1080)**
   - Open the page in the browser
   - Take a screenshot at desktop size
   - Verify layout and spacing look correct

2. **Mobile View (375x812)**
   - Resize viewport to mobile dimensions
   - Take a screenshot at mobile size
   - Verify responsive behavior works correctly

3. **Compare Both Views**
   - Check for layout inconsistencies between viewports
   - Verify no content is cut off or overlapping
   - Ensure touch targets are appropriately sized on mobile

### Playwright Commands to Use:

```
- browser_navigate to file:// path or localhost URL
- browser_resize to set viewport (1920x1080 for desktop, 375x812 for mobile)
- browser_screenshot to capture current state
```

**Do not consider this change complete until visual validation passes for both desktop and mobile views.**
