import { convertMarkdownToXml } from './convertMarkdownToXML';

describe('convertMarkdownToXml', () => {
  // Helper function to normalize whitespace for easier comparison
  const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();

  // Test basic functionality
  describe('basic conversion', () => {
    it('should wrap content in problem tags', () => {
      const result = convertMarkdownToXml('Simple text');
      expect(result).toContain('<problem>');
      expect(result).toContain('</problem>');
    });

    it('should handle empty input', () => {
      const result = convertMarkdownToXml('');
      expect(result).toBe('<problem>\n\n</problem>');
    });
  });

  // Test headers
  describe('headers', () => {
    it('should convert markdown headers to HTML headers', () => {
      const markdown = 'Header Text\n===========';
      const expected = '<h3 class="hd hd-2 problem-header">Header Text</h3>';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain(expected);
    });
  });

  // Test labels and descriptions
  describe('labels and descriptions', () => {
    it('should convert markdown labels', () => {
      const markdown = '>>Question Label<<';
      const expected = '<label>Question Label</label>';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain(expected);
    });

    it('should convert markdown labels with descriptions', () => {
      const markdown = '>>Question Label||Description text<<';
      const expected = '<label>Question Label</label>\n<description>Description text</description>';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain(expected);
    });
  });

  // Test demand hints
  describe('demand hints', () => {
    it('should extract demand hints', () => {
      const markdown = '|| This is a hint ||';
      const expected = '<demandhint>\n  <hint>This is a hint</hint>\n</demandhint>';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain(expected);
    });

    it('should handle multiple demand hints', () => {
      const markdown = '|| First hint ||\n|| Second hint ||';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<hint>First hint</hint>');
      expect(result).toContain('<hint>Second hint</hint>');
    });
  });

  // Test option responses
  describe('option responses', () => {
    it('should convert single-line option response', () => {
      const markdown = '[[Apple, Banana, (Orange)]]';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<optionresponse>');
      expect(result).toContain('<optioninput options="(\'Apple\',\'Banana\',\'Orange\')" correct="Orange"/>');
      expect(result).toContain('</optionresponse>');
    });

    it('should convert multi-line option response', () => {
      const markdown = '[[Apple\nBanana\n(Orange)]]';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<optionresponse>');
      expect(result).toContain('<option correct="False">Apple</option>');
      expect(result).toContain('<option correct="False">Banana</option>');
      expect(result).toContain('<option correct="True">Orange</option>');
    });

    it('should handle option hints', () => {
      const markdown = '[[Apple {{label::This is a hint}}\nBanana\n(Orange)]]';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<optionhint label="label">This is a hint</optionhint>');
    });
  });

  // Test multiple choice responses
  describe('multiple choice responses', () => {
    it('should convert multiple choice questions', () => {
      const markdown = '(x) Correct Answer\n() Wrong Answer';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<multiplechoiceresponse>');
      expect(result).toContain('<choice correct="true">Correct Answer</choice>');
      expect(result).toContain('<choice correct="false">Wrong Answer</choice>');
    });

    it('should handle shuffle flag in multiple choice', () => {
      const markdown = '(x!) Correct Answer\n() Wrong Answer';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('shuffle="true"');
    });

    it('should handle fixed flag in multiple choice', () => {
      const markdown = '(x@) Correct Answer\n() Wrong Answer';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('fixed="true"');
    });

    it('should handle choice hints', () => {
      const markdown = '(x) Correct Answer {{label::Hint text}}\n() Wrong Answer';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<choicehint label="label">Hint text</choicehint>');
    });
  });

  // Test checkbox groups
  describe('checkbox groups', () => {
    it('should convert checkbox questions', () => {
      const markdown = '[x] Correct Option\n[] Wrong Option';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<choiceresponse>');
      expect(result).toContain('<checkboxgroup>');
      expect(result).toContain('<choice correct="true">Correct Option</choice>');
      expect(result).toContain('<choice correct="false">Wrong Option</choice>');
    });

    it('should handle choice hints in checkboxes', () => {
      let markdown = '[x] Option {{selected: Good choice}}';
      let result = convertMarkdownToXml(markdown);
      expect(result).toContain('<choicehint selected="true">Good choice</choicehint>');
      markdown = '[x] Option {{unselected: Bad choice}}';
      result = convertMarkdownToXml(markdown);
      expect(result).toContain('<choicehint selected="false">Bad choice</choicehint>');
    });

    it('should handle compound hints', () => {
      const markdown = '{{ ((A*B)) This is a compound hint }}';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<compoundhint value="A*B">This is a compound hint</compoundhint>');
    });
  });

  // Test numerical responses
  describe('numerical responses', () => {
    it('should convert basic numerical response', () => {
      const markdown = '= 100';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<numericalresponse answer="100">');
      expect(result).toContain('<formulaequationinput/>');
    });

    it('should handle tolerance in numerical response', () => {
      const markdown = '= 100 +- 5';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<numericalresponse answer="100">');
      expect(result).toContain('<responseparam type="tolerance" default="5"/>');
    });

    it('should handle range tolerance', () => {
      const markdown = '= [90, 110]';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<numericalresponse answer="[90, 110]">');
    });

    it('should handle additional answers', () => {
      const markdown = '= 100\nor= 200 {{This is an additional answer}}';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<additional_answer answer="200">');
      expect(result).toContain('<correcthint>This is an additional answer</correcthint>');
    });

    it('should handle correct hints', () => {
      const markdown = '= 100 {{Great job!}}';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<correcthint>Great job!</correcthint>');
    });
  });

  // Test string responses
  describe('string responses', () => {
    it('should convert basic string response', () => {
      const markdown = 's= answer {{Hint}}';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<stringresponse answer="answer" type="ci">');
      expect(result).toContain('<textline size="20"/>');
      expect(result).toContain('<correcthint>Hint</correcthint>');
    });

    it('should handle regexp in string response', () => {
      const markdown = 's= |answer.*';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<stringresponse answer="answer.*" type="ci regexp">');
    });

    it('should handle additional answers', () => {
      const markdown = 's= answer1\nor= answer2 {{This is an additional answer}}';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<additional_answer answer="answer2">');
      expect(result).toContain('<correcthint>This is an additional answer</correcthint>');
    });

    it('should handle string equal hints', () => {
      const markdown = 's= correct\nnot= wrong {{Try again}}';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<stringequalhint answer="wrong">Try again</stringequalhint>');
    });
  });

  // Test explanations and code blocks
  describe('explanations and code blocks', () => {
    it('should convert explanations', () => {
      const markdown = '[explanation]\nThis is an explanation\n[/explanation]';
      const expected = '<solution>\n<div class="detailed-solution">\n<p>Explanation</p>\n\n<p>This is an explanation</p>\n</div>\n</solution>';
      const result = convertMarkdownToXml(markdown);
      expect(normalizeWhitespace(result)).toContain(normalizeWhitespace(expected));
    });

    it('should convert code blocks', () => {
      const markdown = '[code]\nfunction test() {\n  return true;\n}\n[/code]';
      const expected = '<pre><code>function test() {\n  return true;\n}\n</code></pre>';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain(expected);
    });
  });

  // Test paragraph wrapping
  describe('paragraph wrapping', () => {
    it('should wrap text in paragraphs', () => {
      const markdown = 'This is a paragraph.';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<p>This is a paragraph.</p>');
    });

    it('should not wrap text in paragraphs inside pre tags', () => {
      const markdown = '[code]\nThis should not be wrapped\n[/code]';
      const result = convertMarkdownToXml(markdown);
      expect(result).not.toContain('<p>This should not be wrapped</p>');
    });
  });

  // Integration tests for complex cases
  describe('complex integration tests', () => {
    it('should handle a complete problem with multiple components', () => {
      const markdown = `Problem Title
==============
>>What is the capital of France?||Choose the correct answer<<

(x) Paris {{Correct! Paris is indeed the capital of France.}}
() London {{No, London is the capital of the United Kingdom.}}
() Berlin {{No, Berlin is the capital of Germany.}}
() Madrid {{No, Madrid is the capital of Spain.}}

[explanation]
Paris is the capital and most populous city of France.
[/explanation]

|| Need a hint? Think about the Eiffel Tower! ||`;

      const result = convertMarkdownToXml(markdown);

      // Check for main structure elements
      expect(result).toContain('<h3 class="hd hd-2 problem-header">Problem Title</h3>');
      expect(result).toContain('<label>What is the capital of France?</label>');
      expect(result).toContain('<description>Choose the correct answer</description>');
      expect(result).toContain('<multiplechoiceresponse>');
      expect(result).toContain('<choicegroup type="MultipleChoice">');
      expect(result).toContain('<choice correct="true">Paris <choicehint>Correct! Paris is indeed the capital of France.</choicehint>\n</choice>');
      expect(result).toContain('<solution>');
      expect(result).toContain('<demandhint>');
      expect(result).toContain('<hint>Need a hint? Think about the Eiffel Tower!</hint>');
    });

    it('should handle multiple response types separated by ---', () => {
      const markdown = `Question 1
==========
= 42

---

Question 2
==========
s= hello`;

      const result = convertMarkdownToXml(markdown);

      // Check that both questions are included
      expect(result).toContain('<numericalresponse answer="42">');
      expect(result).toContain('<stringresponse answer="hello"');
    });
  });

  // Edge cases and error handling
  describe('edge cases and error handling', () => {
    it('should handle Windows-style line endings', () => {
      const markdown = 'Question\r\n===========\r\n= 42';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<h3 class="hd hd-2 problem-header">Question</h3>');
      expect(result).toContain('<numericalresponse answer="42">');
    });

    it('should handle multiple empty demand hints gracefully', () => {
      const markdown = '|| ||\n|| ||';
      const result = convertMarkdownToXml(markdown);
      expect(result).toContain('<hint></hint>');
    });
  });
});
