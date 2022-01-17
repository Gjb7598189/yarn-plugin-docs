import hostedGitInfo from 'hosted-git-info'

export function hostedFromMani(mani) {
    const r = mani.repository
    const rurl = !r ? null
      : typeof r === 'string' ? r
      : typeof r === 'object' && typeof r.url === 'string' ? r.url
      : null
  
    return (rurl && hostedGitInfo.fromUrl(rurl.replace(/^git\+/, ''))) || null
}
