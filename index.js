import opener from 'opener'
import {BaseCommand} from '@yarnpkg/cli'
import { Option, Command }  from 'clipanion'
import axios from 'axios'
import { hostedFromMani } from './utils'

let urlCache = {}
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

    clear = Option.Boolean(`--clear`, false, {
        description: `清除缓存`,
    });

    async execute() {
        this.clear && (urlCache = {})
        if (!this.packages) return
        const list = this.packages.split(',')
        await Promise.all(list.map(pkg => this.getDocs(pkg)))
    }

    async getDocs (pkg) {
        let url
        if (urlCache[pkg]) {
            url = urlCache[pkg]
        } else {
            const res = await axios(`http://registry.yarnpkg.com/${pkg}`)
            const pckmnt = res.data
            url = urlCache[pkg] = this.getDocsUrl(pckmnt)
        }
        
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