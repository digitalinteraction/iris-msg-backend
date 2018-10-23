import { Types } from 'mongoose'
import * as pug from 'pug'

/**
 * Allocates each item in setA an item from setB,
 * returning a mapping of setA items to their allocation from setB
 * e.g. If setA was people and setB was hats, each person would be given a hat
 * and some people might get allocated the same hats
 *
 * Adapted from https://openlab.ncl.ac.uk/gitlab/what-futures/api/blob/master/web/utils/allocator.js
 */
export function roundRobin<T> (setA: string[], setB: T[], shuffle = true): { [id: string]: T } {
  
  // Shuffle b if asked to
  if (shuffle) setB = shuffleArray(setB)
  
  // Create iterators
  let bIndex = 0
  let mapping: { [id: string]: T } = {}
  
  // Iterate the things in setA
  setA.forEach(a => {
    
    // Allocate the next thing in setB
    mapping[a] = setB[bIndex]
    
    // Move to the next thing in setB (looping around)
    bIndex = (bIndex + 1) % setB.length
  })
  
  // Return the mapping
  return mapping
}

/**
 * Shuffles an array in place ~> https://stackoverflow.com/a/6274381/1515924
 */
export function shuffleArray<T> (a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * If a value is a valid Mongo ObjectId
 */
export function isMongoId (value: any): boolean {
  return Types.ObjectId.isValid(value)
}

/**
 * If a value is a valid member jwt packet, i.e. it has the 'mem' & 'org values
 */
export function isMemberJwt (value: any): boolean {
  return typeof value === 'object'
    && typeof value.mem === 'string'
    && typeof value.org === 'string'
}

/**
 * Compiles a pug template, with a dev-only middleware that recompiles on render
 */
export function compilePug (path: string) {
  return process.env.NODE_ENV === 'development'
  ? (...args: any[]) => pug.compileFile(path)(...args)
  : pug.compileFile(path)
}
