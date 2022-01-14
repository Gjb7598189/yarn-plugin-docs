import opener from 'opener'
import {BaseCommand} from '@yarnpkg/cli';
import { Option }  from 'clipanion';
import axios from 'axios'

class Docs extends BaseCommand {

    static paths = [['docs']]

    packages = Option.String()
    async execute() {
        if (!this.packages) return
        const list = this.packages.split(',')
        list.forEach(item => {
            opener(`https://www.npmjs.com/package/${item}`) 
        })
    }
}

class View extends BaseCommand {
    static paths = [['view']]

    info = Option.String()
    async execute() {
       const [packageName, version] = this.info.split('@')
       const res =  await axios.get(`http://registry.yarnpkg.com/${packageName}/${version || ''}`)
       console.log(res.data, '----')
    }
}

export default {
    commands: [
        Docs,
        View
    ]
}