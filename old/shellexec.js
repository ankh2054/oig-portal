//const { exec } = require("child_process");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)


const shellexec = (command) => {
    exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    return;
});

}


async function shellexec2(command){
  const commandout = await exec(command)
  //return { commandout }
  return { name: commandout.stdout.trim() }
};


exports.shellexec = shellexec ;
exports.shellexec2 = shellexec2 ;
