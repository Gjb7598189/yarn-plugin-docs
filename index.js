import opener from 'opener'
import {BaseCommand} from '@yarnpkg/cli'
import { Option, Command }  from 'clipanion'
import axios from 'axios'
import semver from 'semver'
import hostedGitInfo from 'hosted-git-info'


function hostedFromMani(mani) {
    const r = mani.repository
    const rurl = !r ? null
      : typeof r === 'string' ? r
      : typeof r === 'object' && typeof r.url === 'string' ? r.url
      : null
  
    return (rurl && hostedGitInfo.fromUrl(rurl.replace(/^git\+/, ''))) || null
}

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

    cache = {}
    async execute() {
        if (!this.packages) return
        const list = this.packages.split(',')
        await Promise.all(list.map(pkg => this.getDocs(pkg)))
    }

    async getDocs (pkg) {
        let url
        if (this.cache[pkg]) {
            url = this.cache[pkg]
        } else {
            const res = await axios(`http://registry.yarnpkg.com/${pkg}`)
            const pckmnt = res.data
            url = this.cache[pkg] = this.getDocsUrl(pckmnt)
        }
        await opener(url)
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

class View extends BaseCommand {
    static paths = [['view']]

    identifier = Option.String()
    infoKey = Option.String()
    async execute() {
        const [packageName, version] = this.identifier.split('@')
        const res =  await axios.get(`http://registry.yarnpkg.com/${packageName}`)
        const pckmnt = res.data
        const data = version ? pckmnt.versions[version] : pckmnt
        const versions = Object.keys(pckmnt.versions || []).sort(semver.compareLoose)
        data.versions = versions
        if (pckmnt['dist-tags']) {
            Object.keys(pckmnt['dist-tags']).forEach(key => {
                data[key] = pckmnt['dist-tags'][key]
            })
        }
        const infoKeys = this.infoKey?.split('.')
        const info = infoKeys ? formatInfo(data, infoKeys) : data
        loading.stop()
        if (!info) return
        try {
            if (typeof info === 'string') {
                console.log(info)
            } else {
                console.log(JSON.stringify(info, null, 2))
            }
        } catch(err) {
            console.log(err.message)
        }

        function formatInfo(obj, keys) {
          const res = keys.reduce((pre, next) => {
            return pre ? pre[next] : pre
          }, obj)
          return res
        }
    }
}

export default {
    commands: [
        Docs,
        View
    ]
}