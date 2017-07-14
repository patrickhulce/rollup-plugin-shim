import {named} from 'foo'
import defaultA from 'bar'
import * as all from 'baz'

import {depended} from './es6-dep.js'

export const result = defaultA(named, all, depended)
