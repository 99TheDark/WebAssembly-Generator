(module
 (import "console" "log" (func $log (param f32)))
 (memory 0)
 (func $something (param $a i32) (param $b i32) (result i32)
  (return
   (i32.mul
    (i32.const 3)
    (i32.add
     (local.get $a)
     (local.get $b)
    )
   )
  )
 )
 (export "something" (func $something))
 (func $fib (param $n i32) (result i32)
  (if (result i32)
   (i32.le_s
    (local.get $n)
    (i32.const 1)
   )
   (then
    (return
     (i32.const 1)
    )
   )
   (else
    (return
     (i32.add
      (call $fib
       (i32.sub
        (local.get $n)
        (i32.const 1)
       )
      )
      (call $fib
       (i32.sub
        (local.get $n)
        (i32.const 2)
       )
      )
     )
    )
   )
  )
 )
 (export "fib" (func $fib))
 (func $main
  (local $val1 f32)
  (local $val2 f32)
  (local $maximum f32)
  (local.set $val1
   (f32.convert_i32_s
    (call $something
     (i32.const 5)
     (i32.const 10)
    )
   )
  )
  (local.set $val2
   (f32.convert_i32_s
    (call $fib
     (i32.const 10)
    )
   )
  )
  (local.set $maximum
   (f32.max
    (local.get $val1)
    (local.get $val2)
   )
  )
  (call $log
   (local.get $maximum)
  )
 )
 (export "main" (func $main))
 (start $main)
)
