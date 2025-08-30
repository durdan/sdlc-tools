# AI-Powered Diagram Healing Feature

## Overview

This feature implements AI-powered diagram fixing using Claude API integration. It automatically analyzes malformed Mermaid diagrams and returns corrected syntax while highlighting the changes made.

## Files Added/Modified

### New Files
- `sdlc-tools/app/api/heal-diagram/route.ts` - API endpoint for diagram healing
- `sdlc-tools/app/diagram-fix/page.tsx` - UI page for diagram testing and healing
- `test-diagram-healing.ts` - Test script for the API endpoint

### Modified Files
- `sdlc-tools/components/Navbar.tsx` - Added "Fix Diagrams" navigation link
- `sdlc-tools/app/page.tsx` - Added "Fix Diagrams" button to homepage

## Features

### 1. AI Diagram Healing API (`/api/heal-diagram`)
- **Endpoint**: `POST /api/heal-diagram`
- **Input**: `{ diagramCode: string, errorContext?: string }`
- **Output**: Streaming response with healed diagram and changes
- **Features**:
  - Detects common Mermaid syntax errors
  - Provides context-aware corrections
  - Returns specific changes made
  - Handles various diagram types (flowchart, sequence, class, etc.)

### 2. Interactive UI (`/diagram-fix`)
- **"Fix with AI" button** with loading state
- **Real-time diagram preview** (placeholder for mermaid.js integration)
- **Side-by-side comparison** of original vs. corrected diagrams
- **Highlighted changes** showing exactly what was modified
- **Example malformed diagrams** for testing
- **Apply fixed version** functionality

### 3. Common Errors Detected
- Missing graph direction (`graph TD`, `flowchart TD`)
- Incorrect arrow syntax (using `->` instead of `-->` or `->>`)
- Invalid node IDs with spaces or special characters
- Missing quotes around node labels with spaces
- Incorrect subgraph syntax
- Wrong participant syntax in sequence diagrams
- Invalid class diagram syntax
- Unclosed brackets and braces

## Usage

### Via Web Interface
1. Navigate to `/diagram-fix`
2. Paste malformed Mermaid code in the textarea
3. Click "Fix with AI" button
4. Review the suggested changes
5. Click "Apply Fixed Version" to use the corrected code

### Via API
```typescript
const response = await fetch('/api/heal-diagram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    diagramCode: 'graph\\nA -> B\\nB -> C',
    errorContext: 'Missing direction'
  })
});

// Handle streaming response
const reader = response.body?.getReader();
// ... process streaming data
```

### Testing
Run the test script to verify functionality:

```bash
# Ensure your Next.js dev server is running
npm run dev

# In another terminal, run:
ts-node test-diagram-healing.ts
```

## Architecture

### API Flow
1. **Input Validation**: Validates diagram code exists
2. **Prompt Construction**: Creates specialized prompt with error context
3. **Claude Processing**: Sends to Claude Code SDK for analysis
4. **Response Parsing**: Extracts corrected diagram and changes
5. **Streaming Output**: Returns results via SSE

### UI Flow
1. **Input**: User pastes diagram code
2. **Healing**: Streams to API endpoint with loading state
3. **Comparison**: Shows original vs. corrected side-by-side
4. **Highlights**: Visual indicators of changes made
5. **Application**: Option to replace original with corrected version

## Error Handling

- **API Level**: Comprehensive error catching and streaming error responses
- **UI Level**: User-friendly error display with retry options
- **Fallback**: Returns original diagram if healing fails
- **Validation**: Input validation prevents empty requests

## Integration Points

- **Claude Code SDK**: Uses existing `query()` function with specialized prompts
- **Next.js API Routes**: Follows existing patterns in the codebase
- **UI Components**: Reuses existing Navbar and styling patterns
- **Navigation**: Integrated into main navigation and homepage

## Future Enhancements

1. **Mermaid.js Integration**: Add actual diagram rendering
2. **Diagram Library**: Save/load common diagram templates
3. **Batch Healing**: Process multiple diagrams at once
4. **Export Options**: Export to various formats (SVG, PNG, etc.)
5. **Collaboration**: Share and edit diagrams with teams
6. **Version History**: Track changes over time

## Dependencies

- `@anthropic-ai/claude-code` - AI processing
- `next` - Web framework
- `react` - UI components
- `tailwindcss` - Styling

## Security Considerations

- Input validation prevents injection attacks
- Rate limiting should be implemented for production
- Error messages don't expose sensitive information
- API endpoint follows existing authentication patterns