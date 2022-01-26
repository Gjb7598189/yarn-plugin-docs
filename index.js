import opener from 'opener'
import {BaseCommand} from '@yarnpkg/cli'
import { Option, Command }  from 'clipanion'
import axios from 'axios'
import { hostedFromMani } from './utils'


class Docs extends BaseCommand {

    static paths = [['docs']]

    static usage = Command.Usage({
        category: `docs commands`,
        description: `open the package docs page`,
        details: `
        打开包对应的文档地址
        `,
        examples: [[
          `Open the document page of package`,
          `yarn docs history,lodash,react`,
        ]],
      });

    packages = Option.String()

    async execute() {
        if (!this.packages) return
        const list = this.packages.split(',')
        await Promise.all(list.map(pkg => this.getDocs(pkg)))
    }

    async getDocs (pkg) {
        const res = await axios(`http://registry.yarnpkg.com/${pkg}`)
        const pckmnt = res.data
        const url = this.getDocsUrl(pckmnt)
        !!url && await opener(url)
    }
    
    getDocsUrl (mani) {
        if (mani.homepage) {
            return mani.homepage
        }

        const info = hostedFromMani(mani)
        if (info) {
            return info.docs()
        }

        return 'https://www.npmjs.com/package/' + mani.name
    }
}

export default {
    commands: [
        Docs
    ]
}