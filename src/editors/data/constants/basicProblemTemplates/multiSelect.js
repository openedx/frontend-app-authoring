/* eslint-disable */
 const olx= `<problem>
  <choiceresponse>
    <checkboxgroup>
      <choice correct="true"></choice>
      <choice correct="false"></choice>
      <choice correct="false"></choice>
    </checkboxgroup>
  </choiceresponse>
</problem>`

const markdown = `[x] a correct answer
[ ] an incorrect answer
[ ] an incorrect answer
[x] a correct answer
`

export default { olx, markdown };
