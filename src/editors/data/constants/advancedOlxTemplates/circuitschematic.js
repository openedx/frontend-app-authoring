/* eslint-disable */
// ---
// metadata:
//     display_name: Circuit Schematic Builder
//     markdown: !!null
// data: |
const circuitSchematic = `<problem>
    <p>
        Circuit schematic problems allow students to create virtual circuits by
        arranging elements such as voltage sources, capacitors, resistors, and
        MOSFETs on an interactive grid. The system evaluates a DC, AC, or
        transient analysis of the circuit.
    </p>
    <p>
        For more information, see
        <a href="https://edx.readthedocs.io/projects/edx-partner-course-staff/en/latest/exercises_tools/circuit_schematic_builder.html" target="_blank">
        Circuit Schematic Builder Problem</a> in <i>Building and Running an edX Course</i>.
    </p>
    <p>
        When you add the problem, be sure to select <strong>Settings</strong>
        to specify a <strong>Display Name</strong> and other values that apply.
    </p>
    <p>You can use the following example problems as models.</p>

    <schematicresponse>
        <p>Make a voltage divider that splits the provided voltage evenly.</p>
        <center>
            <schematic height="500" width="600" parts="g,r" analyses="dc"
            initial_value='[["v",[168,144,0],{"value":"dc(1)","_json_":0},["1","0"]],["r",[296,120,0],{"r":"1","_json_":1},["1","output"]],["L",[296,168,3],{"label":"output","_json_":2},["output"]],["w",[296,216,168,216]],["w",[168,216,168,192]],["w",[168,144,168,120]],["w",[168,120,296,120]],["g",[168,216,0],{"_json_":7},["0"]],["view",-67.49999999999994,-78.49999999999994,1.6000000000000003,"50","10","1G",null,"100","1","1000"]]'/>
        </center>
        <answer type="loncapa/python">

dc_value = "dc analysis not found"
for response in submission[0]:
    if response[0] == 'dc':
        for node in response[1:]:
            dc_value = node['output']

if dc_value == .5:
    correct = ['correct']
else:
    correct = ['incorrect']

        </answer>
        <solution>
            <div class="detailed-solution">
                <p>Explanation</p>
                <p>
                    You can form a voltage divider that evenly divides the input
                    voltage with two identically valued resistors, with the sampled
                    voltage taken in between the two.
                </p>
                <p><img src="/static/images/voltage_divider.png" alt=""/></p>
            </div>
        </solution>
    </schematicresponse>

    <schematicresponse>
        <p>Make a high-pass filter.</p>
        <center>
            <schematic height="500" width="600" parts="g,r,s,c" analyses="ac"
            submit_analyses='{"ac":[["NodeA",1,9]]}'
            initial_value='[["v",[160,152,0],{"name":"v1","value":"sin(0,1,1,0,0)","_json_":0},["1","0"]],["w",[160,200,240,200]],["g",[160,200,0],{"_json_":2},["0"]],["L",[240,152,3],{"label":"NodeA","_json_":3},["NodeA"]],["s",[240,152,0],{"color":"cyan","offset":"0","_json_":4},["NodeA"]],["view",64.55878906250004,54.114697265625054,2.5000000000000004,"50","10","1G",null,"100","1","1000"]]'/>        </center>
        <answer type="loncapa/python">

ac_values = None
for response in submission[0]:
    if response[0] == 'ac':
        for node in response[1:]:
            ac_values = node['NodeA']
print "the ac analysis value:", ac_values
if ac_values == None:
    correct = ['incorrect']
elif ac_values[0][1] &lt; ac_values[1][1]:
    correct = ['correct']
else:
    correct = ['incorrect']

        </answer>
        <solution>
            <div class="detailed-solution">
                <p>Explanation</p>
                <p>
                    You can form a simple high-pass filter without any further
                    constraints by simply putting a resistor in series with a
                    capacitor. The actual values of the components do not really
                    matter in this problem.
                </p>
                <p><img src="/static/images/high_pass_filter.png" alt=""/></p>
            </div>
        </solution>
    </schematicresponse>
</problem>`;

export default circuitSchematic;
