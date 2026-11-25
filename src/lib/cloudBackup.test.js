import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {cloudSignIn,cloudSignOut,verifyCloudAccess,currentCloudUser} from './cloudBackup'

const key='ffcloud-auth-v1'
const user={id:'approved-user',email:'test@example.invalid',email_confirmed_at:'2026-01-01'}
const session={access_token:'mock-access',refresh_token:'mock-refresh',expires_in:3600,user}
const response=(data,status=200)=>({ok:status<400,status,json:async()=>data})
let storage,request
beforeEach(()=>{
  storage=new Map()
  vi.stubGlobal('localStorage',{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)})
  vi.stubGlobal('window',new EventTarget())
  vi.stubGlobal('navigator',{})
  request=vi.fn()
  vi.stubGlobal('fetch',request)
})
afterEach(()=>vi.unstubAllGlobals())
describe('Private Cloud-Zugänge',()=>{
  it('rejects and revokes a login without server approval',async()=>{
    request.mockResolvedValueOnce(response(session)).mockResolvedValueOnce(response([])).mockResolvedValueOnce(response(null))
    await expect(cloudSignIn(user.email,'mock')).rejects.toMatchObject({status:403})
    expect(currentCloudUser()).toBeNull()
    expect(request.mock.calls[2][0]).toContain('/logout')
    expect(request.mock.calls[0][1]).toMatchObject({cache:'no-store',redirect:'error'})
  })
  it('stores a session only after approval; logout preserves training',async()=>{
    request.mockResolvedValueOnce(response(session)).mockResolvedValueOnce(response([{user_id:user.id}])).mockResolvedValueOnce(response(null))
    await cloudSignIn(user.email,'mock')
    expect(currentCloudUser()?.id).toBe(user.id)
    storage.set('fitflow-history-v1','[]')
    await cloudSignOut()
    expect(currentCloudUser()).toBeNull()
    expect(storage.get('fitflow-history-v1')).toBe('[]')
  })
  it('shares simultaneous token refreshes',async()=>{
    storage.set(key,JSON.stringify({...session,expires_at:0}))
    request.mockImplementation(async url=>url.includes('refresh_token')?response(session):url.endsWith('/user')?response(user):response([{user_id:user.id}]))
    await Promise.all([verifyCloudAccess(),verifyCloudAccess()])
    expect(request.mock.calls.filter(([url])=>url.includes('refresh_token'))).toHaveLength(1)
  })
  it('rejects invalid refresh credentials as unauthorized',async()=>{
    storage.set(key,JSON.stringify({...session,expires_at:0}))
    request.mockResolvedValueOnce(response({message:'Invalid refresh token'},400))
    await expect(verifyCloudAccess()).rejects.toMatchObject({status:401})
  })
  it('rejects an identity mismatch',async()=>{
    storage.set(key,JSON.stringify({...session,expires_at:Date.now()/1000+3600}))
    request.mockResolvedValueOnce(response({...user,id:'other-user'}))
    await expect(verifyCloudAccess()).rejects.toMatchObject({status:401})
  })
})
