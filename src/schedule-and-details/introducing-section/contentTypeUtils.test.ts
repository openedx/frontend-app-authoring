/**
 * Tests for content type detection utilities
 */
import { containsHtml, determineEditorType, type EditorType } from './contentTypeUtils';

describe('contentTypeUtils', () => {
  describe('containsHtml', () => {
    describe('should return false for non-HTML content', () => {
      test.each([
        ['empty string', ''],
        ['null', null],
        ['plain text', 'This is just plain text'],
        ['text with special characters', 'Text with @#$%^&*()'],
        ['text with quotes', 'Text with "quotes" and \'apostrophes\''],
        ['text with newlines', 'Line 1\nLine 2\nLine 3'],
        ['text with angle brackets but not HTML', '5 < 10 and 10 > 5'],
        ['mathematical expressions', 'x = y < z > w'],
      ] as const)('for %s', (_description: string, input: string | null) => {
        expect(containsHtml(input)).toBe(false);
      });
    });

    describe('should return true for HTML content', () => {
      test.each([
        // Basic HTML tags
        ['simple paragraph', '<p>Hello world</p>'],
        ['heading tag', '<h1>Title</h1>'],
        ['div element', '<div>Content</div>'],
        ['span element', '<span>Text</span>'],
        ['self-closing tag', '<br />'],
        ['self-closing without space', '<br/>'],

        // HTML tags with attributes
        ['tag with class', '<p class="intro">Text</p>'],
        ['tag with id', '<div id="content">Text</div>'],
        ['tag with multiple attributes', '<a href="link" target="_blank">Link</a>'],

        // Mixed case HTML
        ['uppercase tag', '<P>Paragraph</P>'],
        ['mixed case tag', '<DiV>Content</DiV>'],

        // HTML with content
        ['nested tags', '<div><p>Nested paragraph</p></div>'],
        ['multiple tags', '<h1>Title</h1><p>Paragraph</p>'],
        ['formatting tags', 'Text with <strong>bold</strong> and <em>italic</em>'],

        // Complex HTML structures
        ['list structure', '<ul><li>Item 1</li><li>Item 2</li></ul>'],
        ['table structure', '<table><tr><td>Cell</td></tr></table>'],
        ['form elements', '<input type="text" name="field">'],
        ['image tag', '<img src="image.jpg" alt="Image">'],

        // HTML entities
        ['named entities', 'Price: $100 &amp; free shipping'],
        ['more entities', 'Copyright &copy; 2024 &ndash; All rights reserved'],
        ['quotes entity', 'He said &quot;Hello&quot; to me'],
        ['numeric entities', 'Special char: &#8364; &#169;'],

        // HTML with text content
        ['HTML in mixed content', 'Introduction: <p>This is the main content.</p> End.'],
        ['multiple entities', 'A &amp; B &lt; C &gt; D'],

        // Edge cases
        ['unclosed tag', '<p>Unclosed paragraph'],
        ['tag with newlines', '<p>\nMultiline\ncontent\n</p>'],
      ] as const)('for %s', (_description: string, input: string) => {
        expect(containsHtml(input)).toBe(true);
      });
    });

    describe('edge cases', () => {
      test('should handle very long content', () => {
        const longText = 'a'.repeat(10000);
        expect(containsHtml(longText)).toBe(false);

        const longHtml = `<p>${longText}</p>`;
        expect(containsHtml(longHtml)).toBe(true);
      });

      test('should handle content with only whitespace', () => {
        expect(containsHtml('   \n\t   ')).toBe(false);
      });
    });
  });

  describe('determineEditorType', () => {
    describe('should return "text" for non-HTML content', () => {
      test.each([
        ['empty string', ''],
        ['null', null],
        ['plain text', 'This is just plain text content'],
        ['long plain text', 'Lorem ipsum '.repeat(100)],
        ['text with special chars', 'Email: test@example.com, Phone: (555) 123-4567'],
        ['mathematical content', '2 + 2 = 4, x < y, a > b'],
        ['code-like content', 'function() { return value < threshold; }'],
      ] as const)('for %s', (_description: string, input: string | null) => {
        expect(determineEditorType(input)).toBe('text');
      });
    });

    describe('should return "html" for HTML content', () => {
      test.each([
        // Simple HTML
        ['basic paragraph', '<p>Simple paragraph</p>'],
        ['heading', '<h2>Section Title</h2>'],
        ['formatted text', 'Text with <strong>bold</strong> formatting'],

        // Complex HTML structures
        ['nested elements', '<div class="intro"><h2>Title</h2><p>Content</p></div>'],
        ['lists', '<ul><li>First item</li><li>Second item</li></ul>'],
        ['tables', '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>'],
        ['links and images', '<a href="/link"><img src="image.jpg" alt="Image"></a>'],

        // Course content examples
        ['course overview', '<div><h3>Course Overview</h3><p>This course covers...</p><ul><li>Topic 1</li></ul></div>'],
        ['about sidebar', '<div class="sidebar"><h4>About</h4><p>Prerequisites: None</p></div>'],

        // HTML entities
        ['content with entities', 'Price: $100 &amp; includes shipping &ndash; 50% off!'],
        ['mixed content', 'Introduction <p>Main content with &copy; symbol</p> conclusion'],
      ] as const)('for %s', (_description: string, input: string) => {
        expect(determineEditorType(input)).toBe('html');
      });
    });

    describe('integration scenarios', () => {
      test('should handle real course overview content', () => {
        const courseOverview = `
          <div class="course-overview">
            <h2>Introduction to Computer Science</h2>
            <p>This course provides a comprehensive introduction to computer science concepts.</p>
            <h3>What You'll Learn:</h3>
            <ul>
              <li>Programming fundamentals</li>
              <li>Data structures and algorithms</li>
              <li>Software engineering practices</li>
            </ul>
            <p><strong>Prerequisites:</strong> Basic mathematics knowledge</p>
            <p><em>Duration:</em> 12 weeks</p>
          </div>
        `;

        expect(containsHtml(courseOverview)).toBe(true);
        expect(determineEditorType(courseOverview)).toBe('html');
      });

      test('should handle sidebar HTML content', () => {
        const sidebarHtml = `
          <div class="about-sidebar">
            <h4>Course Information</h4>
            <p><strong>Instructor:</strong> Dr. Smith</p>
            <p><strong>Credits:</strong> 3</p>
            <p><strong>Format:</strong> Online &amp; In-person</p>
            <a href="/syllabus">Download Syllabus</a>
          </div>
        `;

        expect(containsHtml(sidebarHtml)).toBe(true);
        expect(determineEditorType(sidebarHtml)).toBe('html');
      });

      test('should handle plain text course descriptions', () => {
        const plainDescription = 'A beginner-friendly course covering the basics of programming. No prior experience required.';

        expect(containsHtml(plainDescription)).toBe(false);
        expect(determineEditorType(plainDescription)).toBe('text');
      });

      test('should handle empty or minimal content', () => {
        expect(determineEditorType('')).toBe('text');
        expect(determineEditorType(' ')).toBe('text');
        expect(determineEditorType(null as any)).toBe('text');
        expect(determineEditorType(undefined as any)).toBe('text');
      });
    });

    describe('type safety', () => {
      test('should return correct EditorType', () => {
        const result: EditorType = determineEditorType('<p>Test</p>');
        expect(result).toBe('html');

        const result2: EditorType = determineEditorType('Plain text');
        expect(result2).toBe('text');
      });
    });

    describe('performance considerations', () => {
      test('should handle very large content efficiently', () => {
        const largeContent = 'This is a large text content. '.repeat(1000);
        const start = Date.now();
        const result = determineEditorType(largeContent);
        const end = Date.now();

        expect(result).toBe('text');
        expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      });

      test('should handle large HTML content efficiently', () => {
        const largeHtml = `<div>${'<p>Paragraph content. </p>'.repeat(1000)}</div>`;
        const start = Date.now();
        const result = determineEditorType(largeHtml);
        const end = Date.now();

        expect(result).toBe('html');
        expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      });
    });
  });

  describe('function integration', () => {
    test('containsHtml and determineEditorType should be consistent', () => {
      const testCases: Array<unknown> = [
        'Plain text',
        '<p>HTML content</p>',
        'Text with &amp; entities',
        '',
        null,
        undefined,
        '<div><h1>Complex</h1><p>HTML</p></div>',
      ];

      testCases.forEach((content) => {
        const hasHtml = containsHtml(content as any);
        const editorType = determineEditorType(content as any);

        if (hasHtml) {
          expect(editorType).toBe('html');
        } else {
          expect(editorType).toBe('text');
        }
      });
    });
  });
});
