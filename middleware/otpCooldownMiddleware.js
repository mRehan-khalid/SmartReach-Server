const redis = require("../config/redisConfig");

const otpRateLimiter = async (req, res, next) => {
  try {
    const { email } = req.body;
    const ip = req.ip;

    if (!email) {
      return res.status(400).json({
        message: "Email required"
      });
    }
    const cooldownKey = `otp:cooldown:${email}`;
    const counterKey = `otp:counter:${email}`;
    const ipKey = `otp:ip:${ip}`;
    // const ipCount = await redis.get(ipKey);
    // if (ipCount && parseInt(ipCount) >= 10) {
    //   const ttl = await redis.ttl(ipKey);
    //   return res.status(429).json({
    //     code: "IP_LIMIT",
    //     message: `Too many requests from this IP. Try again after ${ttl} seconds`
    //   });
    // }
    // await redis.incr(ipKey);
    // await redis.expire(ipKey, 60 * 15); 


    // const cooldown = await redis.get(cooldownKey);
    // if (cooldown) {
    //   const ttl = await redis.ttl(cooldownKey);
    //   return res.status(429).json({
    //     code: "OTP_COOLDOWN",
    //     message: `Please wait ${ttl} seconds before requesting OTP again`
    //   });
    // }
    // await redis.set(cooldownKey, "1", { ex: 120 });

   
    const count = await redis.incr(counterKey);
    if (count === 1) {
      await redis.expire(counterKey, 60 * 15);
    }
    if (count > 1) {
      const ttl = await redis.ttl(counterKey);
        const minutes = Math.ceil(ttl / 60);
      return res.status(429).json({
        code: "OTP_LIMIT",
        message: `Too many OTP requests. Try again after ${minutes} minutes`
      });
    }
    next();
  } catch (err) {
    console.error("OTP Rate Limiter Error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = otpRateLimiter;