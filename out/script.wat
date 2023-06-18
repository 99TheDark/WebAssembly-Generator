(module
 (import "std" "println" (func $log_int (param i32)))
 (import "std" "println" (func $log_float (param f32)))
 (data (i32.const 0) "\00\48\00\65\00\6c\00\6c\00\6f\00\20\00\77\00\6f\00\72\00\6c\00\64\00\21\00\00")
 (data (i32.const 78) "\00\41\00\20\00\57\00\41\00\53\00\4d\00\20\00\27\00\73\00\74\00\72\00\69\00\6e\00\67\00\27\00\00")
 (memory $memory 174)
 (export "memory" (memory $memory))
 (table $myTable 5 funcref)
 (elem
  (i32.const 1)
  $something
  $fib
 )
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
  (local $i i32)
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
  (call $log_float
   (local.get $maximum)
  )
  (local.set $i
   (i32.const 0)
  )
  (loop $loop
   (call $log_int
    (local.get $i)
   )
   (local.set $i
    (i32.add
     (local.get $i)
     (i32.const 1)
    )
   )
   (br_if $loop
    (i32.lt_s
     (local.get $i)
     (i32.const 10)
    )
   )
  )
 )
 (export "main" (func $main))
 (start $main)
)
